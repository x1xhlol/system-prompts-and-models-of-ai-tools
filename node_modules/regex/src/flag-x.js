import {CharClassContext, doublePunctuatorChars, getEndContextForIncompleteExpression, RegexContext, sandboxLoneDoublePunctuatorChar, sandboxUnsafeNulls} from './utils.js';
import {noncapturingDelim} from './utils-internals.js';
import {Context, replaceUnescaped} from 'regex-utilities';

const ws = /^\s$/;
const escapedWsOrHash = /^\\[\s#]$/;
const charClassWs = /^[ \t]$/;
const escapedCharClassWs = /^\\[ \t]$/;
const token = new RegExp(String.raw`
\\(?: [gk]<
  | [pPu]\{
  | c[A-Za-z]
  | u[A-Fa-f\d]{4}
  | x[A-Fa-f\d]{2}
  | 0\d+
)
| \[\^
| ${noncapturingDelim}
| \(\?<
| (?<dp>[${doublePunctuatorChars}])\k<dp>
| --
| \\?.
`.replace(/\s+/g, ''), 'gsu');

/**
Apply transformations for flag x (insignificant whitespace and line comments).

Preprocessors are applied to the outer regex and interpolated patterns, but not interpolated
regexes or strings.
@type {import('./utils.js').Preprocessor}
*/
function flagXPreprocessor(value, runningContext, options) {
  value = String(value);
  let ignoringWs = false;
  let ignoringCharClassWs = false;
  let ignoringComment = false;
  let expression = '';
  let transformed = '';
  let lastSignificantToken = '';
  let lastSignificantCharClassContext = '';
  let separatorNeeded = false;
  const update = (str, options) => {
    const opts = {
      prefix: true,
      postfix: false,
      ...options,
    };
    str = (separatorNeeded && opts.prefix ? '(?:)' : '') + str + (opts.postfix ? '(?:)' : '');
    separatorNeeded = false;
    return str;
  };
  for (const {0: m, index} of value.matchAll(token)) {
    if (ignoringComment) {
      if (m === '\n') {
        ignoringComment = false;
        separatorNeeded = true;
      }
      continue;
    }
    if (ignoringWs) {
      if (ws.test(m)) {
        continue;
      }
      ignoringWs = false;
      separatorNeeded = true;
    } else if (ignoringCharClassWs) {
      if (charClassWs.test(m)) {
        continue;
      }
      ignoringCharClassWs = false;
    }

    expression += m;
    runningContext = getEndContextForIncompleteExpression(expression, runningContext);
    const {regexContext, charClassContext} = runningContext;
    if (
      // `--` is matched in one step, so boundary chars aren't `-` unless separated by whitespace
      m === '-' &&
      regexContext === RegexContext.CHAR_CLASS &&
      lastSignificantCharClassContext === CharClassContext.RANGE &&
      (options.flags.includes('v') || options.unicodeSetsPlugin)
    ) {
      // Need to handle this here since the main regex-parsing code would think the hyphen forms
      // part of a subtraction operator since we've removed preceding whitespace
      throw new Error('Invalid unescaped hyphen as the end value for a range');
    }
    if (
      // `??` is matched in one step by the double punctuator token
      (regexContext === RegexContext.DEFAULT && /^(?:[?*+]|\?\?)$/.test(m)) ||
      (regexContext === RegexContext.INTERVAL_QUANTIFIER && m === '{')
    ) {
      // Skip the separator prefix and connect the quantifier to the previous token. This also
      // allows whitespace between a quantifier and the `?` that makes it lazy. Add a postfix
      // separator if `m` is `?` and we're following token `(`, to sandbox the `?` from following
      // tokens (since `?` can be a group-type marker). Ex: `( ?:)` becomes `(?(?:):)` and throws.
      // The loop we're in matches valid group openings in one step, so we won't arrive here if
      // matching e.g. `(?:`. Flag n could prevent the need for the postfix since bare `(` is
      // converted to `(?:`, but flag x handling always comes first and flag n can be turned off
      transformed += update(m, {prefix: false, postfix: lastSignificantToken === '(' && m === '?'});
    } else if (regexContext === RegexContext.DEFAULT) {
      if (ws.test(m)) {
        ignoringWs = true;
      } else if (m.startsWith('#')) {
        ignoringComment = true;
      } else if (escapedWsOrHash.test(m)) {
        transformed += update(m[1], {prefix: false});
      } else {
        transformed += update(m);
      }
    } else if (regexContext === RegexContext.CHAR_CLASS && m !== '[' && m !== '[^') {
      if (
        charClassWs.test(m) &&
        ( charClassContext === CharClassContext.DEFAULT ||
          charClassContext === CharClassContext.ENCLOSED_Q ||
          charClassContext === CharClassContext.RANGE
        )
      ) {
        ignoringCharClassWs = true;
      } else if (charClassContext === CharClassContext.INVALID_INCOMPLETE_TOKEN) {
        // Need to handle this here since the main regex-parsing code wouldn't know where the token
        // ends if we removed whitespace after an incomplete token that is followed by something
        // that completes the token
        throw new Error(`Invalid incomplete token in character class: "${m}"`);
      } else if (
        escapedCharClassWs.test(m) &&
        (charClassContext === CharClassContext.DEFAULT || charClassContext === CharClassContext.ENCLOSED_Q)
      ) {
        transformed += update(m[1], {prefix: false});
      } else if (charClassContext === CharClassContext.DEFAULT) {
        const nextChar = value[index + 1] ?? '';
        let updated = sandboxUnsafeNulls(m);
        // Avoid escaping lone double punctuators unless required, since some of them are not
        // allowed to be escaped with flag u (the `unicodeSetsPlugin` already unescapes them when
        // using flag u, but it can be set to `null` via an option)
        if (charClassWs.test(nextChar) || m === '^') {
          updated = sandboxLoneDoublePunctuatorChar(updated);
        }
        transformed += update(updated);
      } else {
        transformed += update(m);
      }
    } else {
      transformed += update(m);
    }
    if (!(ignoringWs || ignoringCharClassWs || ignoringComment)) {
      lastSignificantToken = m;
      lastSignificantCharClassContext = charClassContext;
    }
  }
  return {
    transformed,
    runningContext,
  };
}

/**
Remove `(?:)` token separators (most likely added by flag x) in cases where it's safe to do so.
@param {string} expression
@returns {import('./regex.js').PluginResult}
*/
function clean(expression) {
  const sep = String.raw`\(\?:\)`;
  // No need for repeated separators
  expression = replaceUnescaped(expression, `(?:${sep}){2,}`, '(?:)', Context.DEFAULT);
  // No need for separators at:
  // - The beginning, if not followed by a quantifier.
  // - The end.
  // - Outside of character classes:
  //   - If followed by one of `)|.[$\\`, or `(` if that's not followed by `DEFINE)`.
  //     - Technically we shouldn't remove `(?:)` if preceded by `(?(DEFINE` and followed by `)`,
  //       but in this case flag x injects a sandboxing `(?:)` after the preceding invalid `(?`,
  //       so we already get an error from that.
  //   - If preceded by one of `()|.]^>`, `\\[bBdDfnrsStvwW]`, `(?:`, or a lookaround opening.
  //     - So long as the separator is not followed by a quantifier.
  // Examples of things that are not safe to remove `(?:)` at the boundaries of:
  // - Anywhere: Letters, numbers, or any of `-=_,<?*+{}`.
  // - If followed by any of `:!>`.
  // - If preceded by any of `\\[cgkpPux]`.
  // - Anything inside character classes.
  expression = replaceUnescaped(
    expression,
    String.raw`${sep}(?=[)|.[$\\]|\((?!DEFINE)|$)|(?<=[()|.\]^>]|\\[bBdDfnrsStvwW]|\(\?(?:[:=!]|<[=!])|^)${sep}(?![?*+{])`,
    '',
    Context.DEFAULT
  );
  return {
    pattern: expression,
  };
}

export {
  clean,
  flagXPreprocessor,
};
