import {atomic, possessive} from './atomic.js';
import {backcompatPlugin} from './backcompat.js';
import {flagNPreprocessor} from './flag-n.js';
import {clean, flagXPreprocessor} from './flag-x.js';
import {Pattern, pattern} from './pattern.js';
import {RegExpSubclass} from './subclass.js';
import {subroutines} from './subroutines.js';
import {adjustNumberedBackrefs, CharClassContext, containsCharClassUnion, countCaptures, enclosedTokenCharClassContexts, enclosedTokenRegexContexts, envSupportsFlagGroups, envSupportsFlagV, escapeV, getBreakoutChar, getEndContextForIncompleteExpression, preprocess, RegexContext, sandboxLoneCharClassCaret, sandboxLoneDoublePunctuatorChar, sandboxUnsafeNulls} from './utils.js';
import {Context, hasUnescaped, replaceUnescaped} from 'regex-utilities';

/**
@typedef {string | RegExp | Pattern | number} InterpolatedValue
@typedef {{
  flags?: string;
  captureTransfers?: Map<number, Array<number>>;
  hiddenCaptures?: Array<number>;
}} PluginData
@typedef {{
  pattern: string;
  captureTransfers?: Map<number, Array<number>>;
  hiddenCaptures?: Array<number>;
}} PluginResult
@typedef {TemplateStringsArray | {raw: Array<string>}} RawTemplate
@typedef {{
  flags?: string;
  subclass?: boolean;
  plugins?: Array<(expression: string, data: PluginData) => PluginResult>;
  unicodeSetsPlugin?: ((expression: string, data: PluginData) => PluginResult) | null;
  disable?: {
    x?: boolean;
    n?: boolean;
    v?: boolean;
    atomic?: boolean;
    subroutines?: boolean;
  };
  force?: {
    v?: boolean;
  };
}} RegexTagOptions
*/
/**
@template T
@typedef RegexTag
@type {{
  (template: RawTemplate, ...substitutions: ReadonlyArray<InterpolatedValue>): T;
  (flags?: string): RegexTag<T>;
  (options: RegexTagOptions & {subclass?: false}): RegexTag<T>;
  (options: RegexTagOptions & {subclass: true}): RegexTag<RegExpSubclass>;
}}
*/
/**
Template tag for constructing a regex with extended syntax and context-aware interpolation of
regexes, strings, and patterns.

Can be called in several ways:
1. `` regex`…` `` - Regex pattern as a raw string.
2. `` regex('gi')`…` `` - To specify flags.
3. `` regex({flags: 'gi'})`…` `` - With options.
@type {RegexTag<RegExp>}
*/
const regex = (first, ...substitutions) => {
  // Given a template
  if (Array.isArray(first?.raw)) {
    return regexFromTemplate({}, first, ...substitutions);
  // Given flags
  } else if ((typeof first === 'string' || first === undefined) && !substitutions.length) {
    return regexFromTemplate.bind(null, {flags: first ?? ''});
  // Given an options object
  } else if ({}.toString.call(first) === '[object Object]' && !substitutions.length) {
    return regexFromTemplate.bind(null, first);
  }
  throw new Error(`Unexpected arguments: ${JSON.stringify([first, ...substitutions])}`);
};

/**
@template T
@typedef RegexFromTemplate
@type {{
  (options: RegexTagOptions, template: RawTemplate, ...substitutions: ReadonlyArray<InterpolatedValue>) : T;
}}
*/
/**
Returns a RegExp from a template and substitutions to fill the template holes.
@type {RegexFromTemplate<RegExp>}
*/
const regexFromTemplate = (options, template, ...substitutions) => {
  const opts = getOptions(options);
  const prepped = runPreprocessors(template, substitutions, opts);

  let precedingCaptures = 0;
  let expression = '';
  let runningContext;
  // Intersperse raw template strings and substitutions
  prepped.template.raw.forEach((raw, i) => {
    const wrapEscapedStr = !!(prepped.template.raw[i] || prepped.template.raw[i + 1]);
    // Even with flag n enabled, we might have named captures
    precedingCaptures += countCaptures(raw);
    // Sandbox `\0` in character classes. Not needed outside character classes because in other
    // cases a following interpolated value would always be atomized
    expression += sandboxUnsafeNulls(raw, Context.CHAR_CLASS);
    runningContext = getEndContextForIncompleteExpression(expression, runningContext);
    const {regexContext, charClassContext} = runningContext;
    if (i < prepped.template.raw.length - 1) {
      const substitution = prepped.substitutions[i];
      expression += interpolate(substitution, opts.flags, regexContext, charClassContext, wrapEscapedStr, precedingCaptures);
      if (substitution instanceof RegExp) {
        precedingCaptures += countCaptures(substitution.source);
      } else if (substitution instanceof Pattern) {
        precedingCaptures += countCaptures(String(substitution));
      }
    }
  });

  const plugged = runPlugins(expression, opts);
  expression = plugged.pattern;
  try {
    return opts.subclass ?
      new RegExpSubclass(expression, opts.flags, {hiddenCaptures: plugged.hiddenCaptures}) :
      new RegExp(expression, opts.flags);
  } catch (err) {
    // Improve DX by always including the generated source in the error message. Some browsers
    // include it automatically, but not Firefox or Safari
    const stripped = err.message.replace(/ \/.+\/[a-z]*:/, '');
    err.message = `${stripped}: /${expression}/${opts.flags}`;
    throw err;
  }
};

/**
Returns the processed expression and flags as strings.
@param {string} expression
@param {RegexTagOptions} [options]
@returns {{
  pattern: string;
  flags: string;
}}
*/
function rewrite(expression = '', options) {
  const opts = getOptions(options);
  if (opts.subclass) {
    throw new Error('Cannot use option subclass');
  }
  return {
    // NOTE: Since `pattern` is a Regex+ export with special meaning, the term `expression` is used
    // in code to refer to regex source strings, except in the public API
    pattern: runPlugins(
      runPreprocessors({raw: [expression]}, [], opts).template.raw[0],
      opts
    ).pattern,
    flags: opts.flags,
  };
}

/**
Returns a complete set of options, with default values set for options that weren't provided, and
some options augmented for use.
@param {RegexTagOptions} [options]
@returns {Required<RegexTagOptions>}
*/
function getOptions(options) {
  const opts = {
    flags: '',
    subclass: false,
    plugins: [],
    unicodeSetsPlugin: backcompatPlugin,
    disable: {/* n, v, x, atomic, subroutines */},
    force: {/* v */},
    ...options,
  };
  if (/[nuvx]/.test(opts.flags)) {
    throw new Error('Implicit flags v/u/x/n cannot be explicitly added');
  }
  const useFlagV = opts.force.v || (opts.disable.v ? false : envSupportsFlagV);
  opts.flags += useFlagV ? 'v' : 'u';
  if (useFlagV) {
    opts.unicodeSetsPlugin = null;
  }
  return opts;
}

/**
@param {RawTemplate} template
@param {ReadonlyArray<InterpolatedValue>} substitutions
@param {Required<RegexTagOptions>} options
@returns {{
  template: RawTemplate;
  substitutions: ReadonlyArray<InterpolatedValue>;
}}
*/
function runPreprocessors(template, substitutions, options) {
  const preprocessors = [];
  // Implicit flag x is handled first because otherwise some regex syntax (if unescaped) within
  // comments could cause problems when parsing
  if (!options.disable.x) {
    preprocessors.push(flagXPreprocessor);
  }
  // Implicit flag n is a preprocessor because capturing groups affect backreference rewriting in
  // both interpolation and plugins
  if (!options.disable.n) {
    preprocessors.push(flagNPreprocessor);
  }
  for (const pp of preprocessors) {
    ({template, substitutions} = preprocess(template, substitutions, pp, options));
  }
  return {
    template,
    substitutions,
  };
}

/**
@param {string} expression
@param {Required<RegexTagOptions>} options
@returns {Required<PluginResult>}
*/
function runPlugins(expression, {flags, plugins, unicodeSetsPlugin, disable}) {
  let hiddenCaptures = [];
  [ ...plugins, // Run first, so provided plugins can output extended syntax
    ...(disable.subroutines ? [] : [subroutines]),
    ...(disable.atomic      ? [] : [possessive, atomic]),
    ...(disable.x           ? [] : [clean]),
    // Run last, so it doesn't have to worry about parsing extended syntax
    ...(!unicodeSetsPlugin  ? [] : [unicodeSetsPlugin]),
  ].forEach(plugin => {
    const result = plugin(expression, {flags, hiddenCaptures});
    if (typeof result?.pattern !== 'string') {
      throw new Error('Plugin must return an object with a string property "pattern"');
    }
    expression = result.pattern;
    if (result.hiddenCaptures) {
      hiddenCaptures = result.hiddenCaptures;
    }
  });
  return {
    pattern: expression,
    hiddenCaptures,
  };
}

/**
@param {InterpolatedValue} value
@param {string} flags
@param {string} regexContext
@param {string} charClassContext
@param {boolean} wrapEscapedStr
@param {number} precedingCaptures
@returns {string}
*/
function interpolate(value, flags, regexContext, charClassContext, wrapEscapedStr, precedingCaptures) {
  if (value instanceof RegExp && regexContext !== RegexContext.DEFAULT) {
    throw new Error('Cannot interpolate a RegExp at this position because the syntax context does not match');
  }
  if (regexContext === RegexContext.INVALID_INCOMPLETE_TOKEN || charClassContext === CharClassContext.INVALID_INCOMPLETE_TOKEN) {
    // Throw in all cases, but only *need* to handle a preceding unescaped backslash (which would
    // break sandboxing) since other errors would be handled by the invalid generated regex syntax
    throw new Error('Interpolation preceded by invalid incomplete token');
  }
  if (
    typeof value === 'number' &&
    (regexContext === RegexContext.ENCLOSED_U || charClassContext === CharClassContext.ENCLOSED_U)
  ) {
    return value.toString(16);
  }
  const isPattern = value instanceof Pattern;
  let escapedValue = '';
  if (!(value instanceof RegExp)) {
    value = String(value);
    if (!isPattern) {
      escapedValue = escapeV(
        value,
        regexContext === RegexContext.CHAR_CLASS ? Context.CHAR_CLASS : Context.DEFAULT
      );
    }
    // Check `escapedValue` (not just patterns) since possible breakout char `>` isn't escaped
    const breakoutChar = getBreakoutChar(escapedValue || value, regexContext, charClassContext);
    if (breakoutChar) {
      throw new Error(`Unescaped stray "${breakoutChar}" in the interpolated value would have side effects outside it`);
    }
  }

  if (
    regexContext === RegexContext.INTERVAL_QUANTIFIER ||
    regexContext === RegexContext.GROUP_NAME ||
    enclosedTokenRegexContexts.has(regexContext) ||
    enclosedTokenCharClassContexts.has(charClassContext)
  ) {
    return isPattern ? String(value) : escapedValue;
  } else if (regexContext === RegexContext.CHAR_CLASS) {
    if (isPattern) {
      if (hasUnescaped(String(value), '^-|^&&|-$|&&$')) {
        // Sandboxing so we don't change the chars outside the pattern into being part of an
        // operation they didn't initiate. Same problem as starting a pattern with a quantifier
        throw new Error('Cannot use range or set operator at boundary of interpolated pattern; move the operation into the pattern or the operator outside of it');
      }
      const sandboxedValue = sandboxLoneCharClassCaret(sandboxLoneDoublePunctuatorChar(value));
      // Atomize via nested character class `[…]` if it contains implicit or explicit union (check
      // the unadjusted value)
      return containsCharClassUnion(value) ? `[${sandboxedValue}]` : sandboxUnsafeNulls(sandboxedValue);
    }
    // Atomize via nested character class `[…]` if more than one node
    return containsCharClassUnion(escapedValue) ? `[${escapedValue}]` : escapedValue;
  }
  // `RegexContext.DEFAULT`
  if (value instanceof RegExp) {
    const transformed = transformForLocalFlags(value, flags);
    const backrefsAdjusted = adjustNumberedBackrefs(transformed.value, precedingCaptures);
    // Sandbox and atomize; if we used a pattern modifier it has the same effect
    return transformed.usedModifier ? backrefsAdjusted : `(?:${backrefsAdjusted})`;
  }
  if (isPattern) {
    // Sandbox and atomize
    return `(?:${value})`;
  }
  // Sandbox and atomize
  return wrapEscapedStr ? `(?:${escapedValue})` : escapedValue;
}

/**
@param {RegExp} re
@param {string} outerFlags
@returns {{value: string; usedModifier?: boolean;}}
*/
function transformForLocalFlags(re, outerFlags) {
  /** @type {{i: boolean | null; m: boolean | null; s: boolean | null;}} */
  const modFlagsObj = {
    i: null,
    m: null,
    s: null,
  };
  const newlines = '\\n\\r\\u2028\\u2029';
  let value = re.source;
  if (re.ignoreCase !== outerFlags.includes('i')) {
    if (envSupportsFlagGroups) {
      modFlagsObj.i = re.ignoreCase;
    } else {
      throw new Error('Pattern modifiers not supported, so flag i on the outer and interpolated regex must match');
    }
  }
  if (re.dotAll !== outerFlags.includes('s')) {
    if (envSupportsFlagGroups) {
      modFlagsObj.s = re.dotAll;
    } else {
      value = replaceUnescaped(value, '\\.', (re.dotAll ? '[^]' : `[^${newlines}]`), Context.DEFAULT);
    }
  }
  if (re.multiline !== outerFlags.includes('m')) {
    if (envSupportsFlagGroups) {
      modFlagsObj.m = re.multiline;
    } else {
      value = replaceUnescaped(value, '\\^', (re.multiline ? `(?<=^|[${newlines}])` : '(?<![^])'), Context.DEFAULT);
      value = replaceUnescaped(value, '\\$', (re.multiline ? `(?=$|[${newlines}])` : '(?![^])'), Context.DEFAULT);
    }
  }
  if (envSupportsFlagGroups) {
    const keys = Object.keys(modFlagsObj);
    let modifier = keys.filter(k => modFlagsObj[k] === true).join('');
    const modOff = keys.filter(k => modFlagsObj[k] === false).join('');
    if (modOff) {
      modifier += `-${modOff}`;
    }
    if (modifier) {
      return {
        value: `(?${modifier}:${value})`,
        usedModifier: true,
      };
    }
  }
  return {value};
}

export {
  pattern,
  regex,
  rewrite,
};
