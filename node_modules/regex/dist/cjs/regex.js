var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/regex.js
var regex_exports = {};
__export(regex_exports, {
  pattern: () => pattern,
  regex: () => regex,
  rewrite: () => rewrite
});
module.exports = __toCommonJS(regex_exports);

// src/utils-internals.js
var noncapturingDelim = String.raw`\(\?(?:[:=!>A-Za-z\-]|<[=!]|\(DEFINE\))`;
function incrementIfAtLeast(arr, threshold) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] >= threshold) {
      arr[i]++;
    }
  }
}
function spliceStr(str, pos, oldValue, newValue) {
  return str.slice(0, pos) + newValue + str.slice(pos + oldValue.length);
}

// node_modules/.pnpm/regex-utilities@2.3.0/node_modules/regex-utilities/src/index.js
var Context = Object.freeze({
  DEFAULT: "DEFAULT",
  CHAR_CLASS: "CHAR_CLASS"
});
function replaceUnescaped(expression, needle, replacement, context) {
  const re = new RegExp(String.raw`${needle}|(?<$skip>\[\^?|\\?.)`, "gsu");
  const negated = [false];
  let numCharClassesOpen = 0;
  let result = "";
  for (const match of expression.matchAll(re)) {
    const { 0: m, groups: { $skip } } = match;
    if (!$skip && (!context || context === Context.DEFAULT === !numCharClassesOpen)) {
      if (replacement instanceof Function) {
        result += replacement(match, {
          context: numCharClassesOpen ? Context.CHAR_CLASS : Context.DEFAULT,
          negated: negated[negated.length - 1]
        });
      } else {
        result += replacement;
      }
      continue;
    }
    if (m[0] === "[") {
      numCharClassesOpen++;
      negated.push(m[1] === "^");
    } else if (m === "]" && numCharClassesOpen) {
      numCharClassesOpen--;
      negated.pop();
    }
    result += m;
  }
  return result;
}
function forEachUnescaped(expression, needle, callback, context) {
  replaceUnescaped(expression, needle, callback, context);
}
function execUnescaped(expression, needle, pos = 0, context) {
  if (!new RegExp(needle, "su").test(expression)) {
    return null;
  }
  const re = new RegExp(`${needle}|(?<$skip>\\\\?.)`, "gsu");
  re.lastIndex = pos;
  let numCharClassesOpen = 0;
  let match;
  while (match = re.exec(expression)) {
    const { 0: m, groups: { $skip } } = match;
    if (!$skip && (!context || context === Context.DEFAULT === !numCharClassesOpen)) {
      return match;
    }
    if (m === "[") {
      numCharClassesOpen++;
    } else if (m === "]" && numCharClassesOpen) {
      numCharClassesOpen--;
    }
    if (re.lastIndex == match.index) {
      re.lastIndex++;
    }
  }
  return null;
}
function hasUnescaped(expression, needle, context) {
  return !!execUnescaped(expression, needle, 0, context);
}
function getGroupContents(expression, contentsStartPos) {
  const token5 = /\\?./gsu;
  token5.lastIndex = contentsStartPos;
  let contentsEndPos = expression.length;
  let numCharClassesOpen = 0;
  let numGroupsOpen = 1;
  let match;
  while (match = token5.exec(expression)) {
    const [m] = match;
    if (m === "[") {
      numCharClassesOpen++;
    } else if (!numCharClassesOpen) {
      if (m === "(") {
        numGroupsOpen++;
      } else if (m === ")") {
        numGroupsOpen--;
        if (!numGroupsOpen) {
          contentsEndPos = match.index;
          break;
        }
      }
    } else if (m === "]") {
      numCharClassesOpen--;
    }
  }
  return expression.slice(contentsStartPos, contentsEndPos);
}

// src/atomic.js
var atomicPluginToken = new RegExp(String.raw`(?<noncapturingStart>${noncapturingDelim})|(?<capturingStart>\((?:\?<[^>]+>)?)|\\?.`, "gsu");
function atomic(expression, data) {
  const hiddenCaptures = data?.hiddenCaptures ?? [];
  let captureTransfers = data?.captureTransfers ?? /* @__PURE__ */ new Map();
  if (!/\(\?>/.test(expression)) {
    return {
      pattern: expression,
      captureTransfers,
      hiddenCaptures
    };
  }
  const aGDelim = "(?>";
  const emulatedAGDelim = "(?:(?=(";
  const captureNumMap = [0];
  const addedHiddenCaptures = [];
  let numCapturesBeforeAG = 0;
  let numAGs = 0;
  let aGPos = NaN;
  let hasProcessedAG;
  do {
    hasProcessedAG = false;
    let numCharClassesOpen = 0;
    let numGroupsOpenInAG = 0;
    let inAG = false;
    let match;
    atomicPluginToken.lastIndex = Number.isNaN(aGPos) ? 0 : aGPos + emulatedAGDelim.length;
    while (match = atomicPluginToken.exec(expression)) {
      const { 0: m, index, groups: { capturingStart, noncapturingStart } } = match;
      if (m === "[") {
        numCharClassesOpen++;
      } else if (!numCharClassesOpen) {
        if (m === aGDelim && !inAG) {
          aGPos = index;
          inAG = true;
        } else if (inAG && noncapturingStart) {
          numGroupsOpenInAG++;
        } else if (capturingStart) {
          if (inAG) {
            numGroupsOpenInAG++;
          } else {
            numCapturesBeforeAG++;
            captureNumMap.push(numCapturesBeforeAG + numAGs);
          }
        } else if (m === ")" && inAG) {
          if (!numGroupsOpenInAG) {
            numAGs++;
            const addedCaptureNum = numCapturesBeforeAG + numAGs;
            expression = `${expression.slice(0, aGPos)}${emulatedAGDelim}${expression.slice(aGPos + aGDelim.length, index)}))<$$${addedCaptureNum}>)${expression.slice(index + 1)}`;
            hasProcessedAG = true;
            addedHiddenCaptures.push(addedCaptureNum);
            incrementIfAtLeast(hiddenCaptures, addedCaptureNum);
            if (captureTransfers.size) {
              const newCaptureTransfers = /* @__PURE__ */ new Map();
              captureTransfers.forEach((from, to) => {
                newCaptureTransfers.set(
                  to >= addedCaptureNum ? to + 1 : to,
                  from.map((f) => f >= addedCaptureNum ? f + 1 : f)
                );
              });
              captureTransfers = newCaptureTransfers;
            }
            break;
          }
          numGroupsOpenInAG--;
        }
      } else if (m === "]") {
        numCharClassesOpen--;
      }
    }
  } while (hasProcessedAG);
  hiddenCaptures.push(...addedHiddenCaptures);
  expression = replaceUnescaped(
    expression,
    String.raw`\\(?<backrefNum>[1-9]\d*)|<\$\$(?<wrappedBackrefNum>\d+)>`,
    ({ 0: m, groups: { backrefNum, wrappedBackrefNum } }) => {
      if (backrefNum) {
        const bNum = +backrefNum;
        if (bNum > captureNumMap.length - 1) {
          throw new Error(`Backref "${m}" greater than number of captures`);
        }
        return `\\${captureNumMap[bNum]}`;
      }
      return `\\${wrappedBackrefNum}`;
    },
    Context.DEFAULT
  );
  return {
    pattern: expression,
    captureTransfers,
    hiddenCaptures
  };
}
var baseQuantifier = String.raw`(?:[?*+]|\{\d+(?:,\d*)?\})`;
var possessivePluginToken = new RegExp(String.raw`
\\(?: \d+
  | c[A-Za-z]
  | [gk]<[^>]+>
  | [pPu]\{[^\}]+\}
  | u[A-Fa-f\d]{4}
  | x[A-Fa-f\d]{2}
  )
| \((?: \? (?: [:=!>]
  | <(?:[=!]|[^>]+>)
  | [A-Za-z\-]+:
  | \(DEFINE\)
  ))?
| (?<qBase>${baseQuantifier})(?<qMod>[?+]?)(?<invalidQ>[?*+\{]?)
| \\?.
`.replace(/\s+/g, ""), "gsu");
function possessive(expression) {
  if (!new RegExp(`${baseQuantifier}\\+`).test(expression)) {
    return {
      pattern: expression
    };
  }
  const openGroupIndices = [];
  let lastGroupIndex = null;
  let lastCharClassIndex = null;
  let lastToken = "";
  let numCharClassesOpen = 0;
  let match;
  possessivePluginToken.lastIndex = 0;
  while (match = possessivePluginToken.exec(expression)) {
    const { 0: m, index, groups: { qBase, qMod, invalidQ } } = match;
    if (m === "[") {
      if (!numCharClassesOpen) {
        lastCharClassIndex = index;
      }
      numCharClassesOpen++;
    } else if (m === "]") {
      if (numCharClassesOpen) {
        numCharClassesOpen--;
      } else {
        lastCharClassIndex = null;
      }
    } else if (!numCharClassesOpen) {
      if (qMod === "+" && lastToken && !lastToken.startsWith("(")) {
        if (invalidQ) {
          throw new Error(`Invalid quantifier "${m}"`);
        }
        let charsAdded = -1;
        if (/^\{\d+\}$/.test(qBase)) {
          expression = spliceStr(expression, index + qBase.length, qMod, "");
        } else {
          if (lastToken === ")" || lastToken === "]") {
            const nodeIndex = lastToken === ")" ? lastGroupIndex : lastCharClassIndex;
            if (nodeIndex === null) {
              throw new Error(`Invalid unmatched "${lastToken}"`);
            }
            expression = `${expression.slice(0, nodeIndex)}(?>${expression.slice(nodeIndex, index)}${qBase})${expression.slice(index + m.length)}`;
          } else {
            expression = `${expression.slice(0, index - lastToken.length)}(?>${lastToken}${qBase})${expression.slice(index + m.length)}`;
          }
          charsAdded += 4;
        }
        possessivePluginToken.lastIndex += charsAdded;
      } else if (m[0] === "(") {
        openGroupIndices.push(index);
      } else if (m === ")") {
        lastGroupIndex = openGroupIndices.length ? openGroupIndices.pop() : null;
      }
    }
    lastToken = m;
  }
  return {
    pattern: expression
  };
}

// src/pattern.js
var Pattern = class {
  #value;
  /** @param {string} value */
  constructor(value) {
    this.#value = value;
  }
  /** @returns {string} */
  toString() {
    return String(this.#value);
  }
};
function pattern(first, ...substitutions) {
  if (Array.isArray(first?.raw)) {
    return new Pattern(
      // Intersperse raw template strings and substitutions
      first.raw.flatMap((raw, i) => i < first.raw.length - 1 ? [raw, substitutions[i]] : raw).join("")
    );
  } else if (!substitutions.length) {
    return new Pattern(first === void 0 ? "" : first);
  }
  throw new Error(`Unexpected arguments: ${JSON.stringify([first, ...substitutions])}`);
}

// src/utils.js
var RegexContext = {
  DEFAULT: "DEFAULT",
  CHAR_CLASS: "CHAR_CLASS",
  ENCLOSED_P: "ENCLOSED_P",
  ENCLOSED_U: "ENCLOSED_U",
  GROUP_NAME: "GROUP_NAME",
  INTERVAL_QUANTIFIER: "INTERVAL_QUANTIFIER",
  INVALID_INCOMPLETE_TOKEN: "INVALID_INCOMPLETE_TOKEN"
};
var CharClassContext = {
  DEFAULT: "DEFAULT",
  ENCLOSED_P: "ENCLOSED_P",
  ENCLOSED_Q: "ENCLOSED_Q",
  ENCLOSED_U: "ENCLOSED_U",
  INVALID_INCOMPLETE_TOKEN: "INVALID_INCOMPLETE_TOKEN",
  RANGE: "RANGE"
};
var enclosedTokenRegexContexts = /* @__PURE__ */ new Set([
  RegexContext.ENCLOSED_P,
  RegexContext.ENCLOSED_U
]);
var enclosedTokenCharClassContexts = /* @__PURE__ */ new Set([
  CharClassContext.ENCLOSED_P,
  CharClassContext.ENCLOSED_Q,
  CharClassContext.ENCLOSED_U
]);
var envSupportsFlagGroups = (() => {
  try {
    new RegExp("(?i:)");
  } catch {
    return false;
  }
  return true;
})();
var envSupportsFlagV = (() => {
  try {
    new RegExp("", "v");
  } catch {
    return false;
  }
  return true;
})();
var doublePunctuatorChars = "&!#$%*+,.:;<=>?@^`~";
var namedCapturingDelim = String.raw`\(\?<(?![=!])(?<captureName>[^>]+)>`;
var capturingDelim = String.raw`\((?!\?)(?!(?<=\(\?\()DEFINE\))|${namedCapturingDelim}`;
function adjustNumberedBackrefs(expression, precedingCaptures) {
  return replaceUnescaped(
    expression,
    String.raw`\\(?<num>[1-9]\d*)`,
    ({ groups: { num } }) => `\\${+num + precedingCaptures}`,
    Context.DEFAULT
  );
}
var stringPropertyNames = [
  "Basic_Emoji",
  "Emoji_Keycap_Sequence",
  "RGI_Emoji_Modifier_Sequence",
  "RGI_Emoji_Flag_Sequence",
  "RGI_Emoji_Tag_Sequence",
  "RGI_Emoji_ZWJ_Sequence",
  "RGI_Emoji"
].join("|");
var charClassUnionToken = new RegExp(String.raw`
\\(?: c[A-Za-z]
  | p\{(?<pStrProp>${stringPropertyNames})\}
  | [pP]\{[^\}]+\}
  | (?<qStrProp>q)
  | u(?:[A-Fa-f\d]{4}|\{[A-Fa-f\d]+\})
  | x[A-Fa-f\d]{2}
  | .
)
| --
| &&
| .
`.replace(/\s+/g, ""), "gsu");
function containsCharClassUnion(charClassPattern) {
  let hasFirst = false;
  let lastM;
  for (const { 0: m, groups } of charClassPattern.matchAll(charClassUnionToken)) {
    if (groups.pStrProp || groups.qStrProp) {
      return true;
    }
    if (m === "[" && hasFirst) {
      return true;
    }
    if (["-", "--", "&&"].includes(m)) {
      hasFirst = false;
    } else if (m !== "[" && m !== "]") {
      if (hasFirst || lastM === "]") {
        return true;
      }
      hasFirst = true;
    }
    lastM = m;
  }
  return false;
}
function countCaptures(expression) {
  let num = 0;
  forEachUnescaped(expression, capturingDelim, () => num++, Context.DEFAULT);
  return num;
}
function escapeV(str, context) {
  if (context === Context.CHAR_CLASS) {
    return str.replace(new RegExp(String.raw`[()\[\]{}|\\/\-${doublePunctuatorChars}]`, "g"), "\\$&");
  }
  return str.replace(/[()\[\]{}|\\^$*+?.]/g, "\\$&");
}
function getBreakoutChar(expression, regexContext, charClassContext) {
  const escapesRemoved = expression.replace(/\\./gsu, "");
  if (escapesRemoved.endsWith("\\")) {
    return "\\";
  }
  if (regexContext === RegexContext.DEFAULT) {
    return getUnbalancedChar(escapesRemoved, "(", ")");
  } else if (regexContext === RegexContext.CHAR_CLASS && !enclosedTokenCharClassContexts.has(charClassContext)) {
    return getUnbalancedChar(escapesRemoved, "[", "]");
  } else if (regexContext === RegexContext.INTERVAL_QUANTIFIER || enclosedTokenRegexContexts.has(regexContext) || enclosedTokenCharClassContexts.has(charClassContext)) {
    if (escapesRemoved.includes("}")) {
      return "}";
    }
  } else if (regexContext === RegexContext.GROUP_NAME) {
    if (escapesRemoved.includes(">")) {
      return ">";
    }
  }
  return "";
}
var contextToken = new RegExp(String.raw`
(?<groupN>\(\?<(?![=!])|\\[gk]<)
| (?<enclosedPU>\\[pPu]\{)
| (?<enclosedQ>\\q\{)
| (?<intervalQ>\{)
| (?<incompleteT>\\(?: $
  | c(?![A-Za-z])
  | u(?![A-Fa-f\d]{4})[A-Fa-f\d]{0,3}
  | x(?![A-Fa-f\d]{2})[A-Fa-f\d]?
  )
)
| --
| \\?.
`.replace(/\s+/g, ""), "gsu");
function getEndContextForIncompleteExpression(incompleteExpression, runningContext) {
  let { regexContext, charClassContext, charClassDepth, lastPos } = {
    regexContext: RegexContext.DEFAULT,
    charClassContext: CharClassContext.DEFAULT,
    charClassDepth: 0,
    lastPos: 0,
    ...runningContext
  };
  contextToken.lastIndex = lastPos;
  let match;
  while (match = contextToken.exec(incompleteExpression)) {
    const { 0: m, groups: { groupN, enclosedPU, enclosedQ, intervalQ, incompleteT } } = match;
    if (m === "[") {
      charClassDepth++;
      regexContext = RegexContext.CHAR_CLASS;
      charClassContext = CharClassContext.DEFAULT;
    } else if (m === "]" && regexContext === RegexContext.CHAR_CLASS) {
      if (charClassDepth) {
        charClassDepth--;
      }
      if (!charClassDepth) {
        regexContext = RegexContext.DEFAULT;
      }
      charClassContext = CharClassContext.DEFAULT;
    } else if (regexContext === RegexContext.CHAR_CLASS) {
      if (incompleteT) {
        charClassContext = CharClassContext.INVALID_INCOMPLETE_TOKEN;
      } else if (m === "-") {
        charClassContext = CharClassContext.RANGE;
      } else if (enclosedPU) {
        charClassContext = m[1] === "u" ? CharClassContext.ENCLOSED_U : CharClassContext.ENCLOSED_P;
      } else if (enclosedQ) {
        charClassContext = CharClassContext.ENCLOSED_Q;
      } else if (m === "}" && enclosedTokenCharClassContexts.has(charClassContext) || // Don't continue in these contexts since we've advanced another token
      charClassContext === CharClassContext.INVALID_INCOMPLETE_TOKEN || charClassContext === CharClassContext.RANGE) {
        charClassContext = CharClassContext.DEFAULT;
      }
    } else {
      if (incompleteT) {
        regexContext = RegexContext.INVALID_INCOMPLETE_TOKEN;
      } else if (groupN) {
        regexContext = RegexContext.GROUP_NAME;
      } else if (enclosedPU) {
        regexContext = m[1] === "u" ? RegexContext.ENCLOSED_U : RegexContext.ENCLOSED_P;
      } else if (intervalQ) {
        regexContext = RegexContext.INTERVAL_QUANTIFIER;
      } else if (m === ">" && regexContext === RegexContext.GROUP_NAME || m === "}" && (regexContext === RegexContext.INTERVAL_QUANTIFIER || enclosedTokenRegexContexts.has(regexContext)) || // Don't continue in this context since we've advanced another token
      regexContext === RegexContext.INVALID_INCOMPLETE_TOKEN) {
        regexContext = RegexContext.DEFAULT;
      }
    }
  }
  return {
    regexContext,
    charClassContext,
    charClassDepth,
    lastPos: incompleteExpression.length
  };
}
function getUnbalancedChar(expression, leftChar, rightChar) {
  let numOpen = 0;
  for (const [m] of expression.matchAll(new RegExp(`[${escapeV(leftChar + rightChar, Context.CHAR_CLASS)}]`, "g"))) {
    numOpen += m === leftChar ? 1 : -1;
    if (numOpen < 0) {
      return rightChar;
    }
  }
  if (numOpen > 0) {
    return leftChar;
  }
  return "";
}
function preprocess(template, substitutions, preprocessor, options) {
  let newTemplate = { raw: [] };
  let newSubstitutions = [];
  let runningContext;
  template.raw.forEach((raw, i) => {
    const result = preprocessor(raw, { ...runningContext, lastPos: 0 }, options);
    newTemplate.raw.push(result.transformed);
    runningContext = result.runningContext;
    if (i < template.raw.length - 1) {
      const substitution = substitutions[i];
      if (substitution instanceof Pattern) {
        const result2 = preprocessor(substitution, { ...runningContext, lastPos: 0 }, options);
        newSubstitutions.push(pattern(result2.transformed));
        runningContext = result2.runningContext;
      } else {
        newSubstitutions.push(substitution);
      }
    }
  });
  return {
    template: newTemplate,
    substitutions: newSubstitutions
  };
}
function sandboxLoneCharClassCaret(str) {
  return str.replace(/^\^/, "\\^^");
}
function sandboxLoneDoublePunctuatorChar(str) {
  return str.replace(new RegExp(`^([${doublePunctuatorChars}])(?!\\1)`), (m, _, pos) => {
    return `\\${m}${pos + 1 === str.length ? "" : m}`;
  });
}
function sandboxUnsafeNulls(str, context) {
  return replaceUnescaped(str, String.raw`\\0(?!\d)`, "\\x00", context);
}

// src/backcompat.js
var incompatibleEscapeChars = "&!#%,:;<=>@`~";
var token = new RegExp(String.raw`
\[\^?-?
| --?\]
| (?<dp>[${doublePunctuatorChars}])\k<dp>
| --
| \\(?<vOnlyEscape>[${incompatibleEscapeChars}])
| \\[pPu]\{[^}]+\}
| \\?.
`.replace(/\s+/g, ""), "gsu");
function backcompatPlugin(expression) {
  const unescapedLiteralHyphenMsg = 'Invalid unescaped "-" in character class';
  let inCharClass = false;
  let result = "";
  for (const { 0: m, groups: { dp, vOnlyEscape } } of expression.matchAll(token)) {
    if (m[0] === "[") {
      if (inCharClass) {
        throw new Error("Invalid nested character class when flag v not supported; possibly from interpolation");
      }
      if (m.endsWith("-")) {
        throw new Error(unescapedLiteralHyphenMsg);
      }
      inCharClass = true;
    } else if (m.endsWith("]")) {
      if (m[0] === "-") {
        throw new Error(unescapedLiteralHyphenMsg);
      }
      inCharClass = false;
    } else if (inCharClass) {
      if (m === "&&" || m === "--") {
        throw new Error(`Invalid set operator "${m}" when flag v not supported`);
      } else if (dp) {
        throw new Error(`Invalid double punctuator "${m}", reserved by flag v`);
      } else if ("(){}/|".includes(m)) {
        throw new Error(`Invalid unescaped "${m}" in character class`);
      } else if (vOnlyEscape) {
        result += vOnlyEscape;
        continue;
      }
    }
    result += m;
  }
  return {
    pattern: result
  };
}

// src/flag-n.js
var token2 = new RegExp(String.raw`
${noncapturingDelim}
| \(\?<
| (?<backrefNum>\\[1-9]\d*)
| \\?.
`.replace(/\s+/g, ""), "gsu");
function flagNPreprocessor(value, runningContext) {
  value = String(value);
  let expression = "";
  let transformed = "";
  for (const { 0: m, groups: { backrefNum } } of value.matchAll(token2)) {
    expression += m;
    runningContext = getEndContextForIncompleteExpression(expression, runningContext);
    const { regexContext } = runningContext;
    if (regexContext === RegexContext.DEFAULT) {
      if (m === "(") {
        transformed += "(?:";
      } else if (backrefNum) {
        throw new Error(`Invalid decimal escape "${m}" with implicit flag n; replace with named backreference`);
      } else {
        transformed += m;
      }
    } else {
      transformed += m;
    }
  }
  return {
    transformed,
    runningContext
  };
}

// src/flag-x.js
var ws = /^\s$/;
var escapedWsOrHash = /^\\[\s#]$/;
var charClassWs = /^[ \t]$/;
var escapedCharClassWs = /^\\[ \t]$/;
var token3 = new RegExp(String.raw`
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
`.replace(/\s+/g, ""), "gsu");
function flagXPreprocessor(value, runningContext, options) {
  value = String(value);
  let ignoringWs = false;
  let ignoringCharClassWs = false;
  let ignoringComment = false;
  let expression = "";
  let transformed = "";
  let lastSignificantToken = "";
  let lastSignificantCharClassContext = "";
  let separatorNeeded = false;
  const update = (str, options2) => {
    const opts = {
      prefix: true,
      postfix: false,
      ...options2
    };
    str = (separatorNeeded && opts.prefix ? "(?:)" : "") + str + (opts.postfix ? "(?:)" : "");
    separatorNeeded = false;
    return str;
  };
  for (const { 0: m, index } of value.matchAll(token3)) {
    if (ignoringComment) {
      if (m === "\n") {
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
    const { regexContext, charClassContext } = runningContext;
    if (
      // `--` is matched in one step, so boundary chars aren't `-` unless separated by whitespace
      m === "-" && regexContext === RegexContext.CHAR_CLASS && lastSignificantCharClassContext === CharClassContext.RANGE && (options.flags.includes("v") || options.unicodeSetsPlugin)
    ) {
      throw new Error("Invalid unescaped hyphen as the end value for a range");
    }
    if (
      // `??` is matched in one step by the double punctuator token
      regexContext === RegexContext.DEFAULT && /^(?:[?*+]|\?\?)$/.test(m) || regexContext === RegexContext.INTERVAL_QUANTIFIER && m === "{"
    ) {
      transformed += update(m, { prefix: false, postfix: lastSignificantToken === "(" && m === "?" });
    } else if (regexContext === RegexContext.DEFAULT) {
      if (ws.test(m)) {
        ignoringWs = true;
      } else if (m.startsWith("#")) {
        ignoringComment = true;
      } else if (escapedWsOrHash.test(m)) {
        transformed += update(m[1], { prefix: false });
      } else {
        transformed += update(m);
      }
    } else if (regexContext === RegexContext.CHAR_CLASS && m !== "[" && m !== "[^") {
      if (charClassWs.test(m) && (charClassContext === CharClassContext.DEFAULT || charClassContext === CharClassContext.ENCLOSED_Q || charClassContext === CharClassContext.RANGE)) {
        ignoringCharClassWs = true;
      } else if (charClassContext === CharClassContext.INVALID_INCOMPLETE_TOKEN) {
        throw new Error(`Invalid incomplete token in character class: "${m}"`);
      } else if (escapedCharClassWs.test(m) && (charClassContext === CharClassContext.DEFAULT || charClassContext === CharClassContext.ENCLOSED_Q)) {
        transformed += update(m[1], { prefix: false });
      } else if (charClassContext === CharClassContext.DEFAULT) {
        const nextChar = value[index + 1] ?? "";
        let updated = sandboxUnsafeNulls(m);
        if (charClassWs.test(nextChar) || m === "^") {
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
    runningContext
  };
}
function clean(expression) {
  const sep = String.raw`\(\?:\)`;
  expression = replaceUnescaped(expression, `(?:${sep}){2,}`, "(?:)", Context.DEFAULT);
  expression = replaceUnescaped(
    expression,
    String.raw`${sep}(?=[)|.[$\\]|\((?!DEFINE)|$)|(?<=[()|.\]^>]|\\[bBdDfnrsStvwW]|\(\?(?:[:=!]|<[=!])|^)${sep}(?![?*+{])`,
    "",
    Context.DEFAULT
  );
  return {
    pattern: expression
  };
}

// src/subclass.js
var RegExpSubclass = class _RegExpSubclass extends RegExp {
  // Avoid `#private` to allow for subclassing
  /**
  @private
  @type {Map<number, {
    hidden: true;
  }>}
  */
  _captureMap;
  /**
  @overload
  @param {string} expression
  @param {string} [flags]
  @param {{
    hiddenCaptures?: Array<number>;
  }} [options]
  */
  /**
  @overload
  @param {RegExpSubclass} expression
  @param {string} [flags]
  */
  constructor(expression, flags, options) {
    if (expression instanceof RegExp) {
      if (options) {
        throw new Error("Cannot provide options when copying a regexp");
      }
      super(expression, flags);
      if (expression instanceof _RegExpSubclass) {
        this._captureMap = expression._captureMap;
      } else {
        this._captureMap = /* @__PURE__ */ new Map();
      }
    } else {
      super(expression, flags);
      const hiddenCaptures = options?.hiddenCaptures ?? [];
      this._captureMap = createCaptureMap(hiddenCaptures);
    }
  }
  /**
  Called internally by all String/RegExp methods that use regexes.
  @override
  @param {string} str
  @returns {RegExpExecArray | null}
  */
  exec(str) {
    const match = super.exec(str);
    if (!match || !this._captureMap.size) {
      return match;
    }
    const matchCopy = [...match];
    match.length = 1;
    let indicesCopy;
    if (this.hasIndices) {
      indicesCopy = [...match.indices];
      match.indices.length = 1;
    }
    for (let i = 1; i < matchCopy.length; i++) {
      if (!this._captureMap.get(i)?.hidden) {
        match.push(matchCopy[i]);
        if (this.hasIndices) {
          match.indices.push(indicesCopy[i]);
        }
      }
    }
    return match;
  }
};
function createCaptureMap(hiddenCaptures) {
  const captureMap = /* @__PURE__ */ new Map();
  for (const num of hiddenCaptures) {
    captureMap.set(num, {
      hidden: true
    });
  }
  return captureMap;
}

// src/subroutines.js
function subroutines(expression, data) {
  const namedGroups = getNamedCapturingGroups(expression, { includeContents: true });
  const transformed = processSubroutines(expression, namedGroups, data?.hiddenCaptures ?? []);
  return {
    pattern: processDefinitionGroup(transformed.pattern, namedGroups),
    hiddenCaptures: transformed.hiddenCaptures
  };
}
var subroutinePattern = String.raw`\\g<(?<subroutineName>[^>&]+)>`;
var token4 = new RegExp(String.raw`
${subroutinePattern}
| (?<capturingStart>${capturingDelim})
| \\(?<backrefNum>[1-9]\d*)
| \\k<(?<backrefName>[^>]+)>
| \\?.
`.replace(/\s+/g, ""), "gsu");
function processSubroutines(expression, namedGroups, hiddenCaptures) {
  if (!/\\g</.test(expression)) {
    return {
      pattern: expression,
      hiddenCaptures
    };
  }
  const hasBackrefs = hasUnescaped(expression, "\\\\(?:[1-9]|k<[^>]+>)", Context.DEFAULT);
  const subroutineWrapper = hasBackrefs ? "(" : "(?:";
  const openSubroutines = /* @__PURE__ */ new Map();
  const openSubroutinesStack = [];
  const captureNumMap = [0];
  const addedHiddenCaptures = [];
  let numCapturesPassedOutsideSubroutines = 0;
  let numCapturesPassedInsideSubroutines = 0;
  let numCapturesPassedInsideThisSubroutine = 0;
  let numSubroutineCapturesTrackedInRemap = 0;
  let numCharClassesOpen = 0;
  let match;
  token4.lastIndex = 0;
  while (match = token4.exec(expression)) {
    const { 0: m, index, groups: { subroutineName, capturingStart, backrefNum, backrefName } } = match;
    if (m === "[") {
      numCharClassesOpen++;
    } else if (!numCharClassesOpen) {
      if (subroutineName) {
        if (!namedGroups.has(subroutineName)) {
          throw new Error(`Invalid named capture referenced by subroutine ${m}`);
        }
        if (openSubroutines.has(subroutineName)) {
          throw new Error(`Subroutine ${m} followed a recursive reference`);
        }
        const contents = namedGroups.get(subroutineName).contents;
        const subroutineValue = `${subroutineWrapper}${contents})`;
        if (hasBackrefs) {
          numCapturesPassedInsideThisSubroutine = 0;
          numCapturesPassedInsideSubroutines++;
          updateHiddenCaptureTracking(
            hiddenCaptures,
            addedHiddenCaptures,
            numCapturesPassedOutsideSubroutines + numCapturesPassedInsideSubroutines
          );
        }
        openSubroutines.set(subroutineName, {
          // Incrementally decremented to track when we've left the group
          unclosedGroupCount: countOpenParens(subroutineValue)
        });
        openSubroutinesStack.push(subroutineName);
        expression = spliceStr(expression, index, m, subroutineValue);
        token4.lastIndex -= m.length - subroutineWrapper.length;
      } else if (capturingStart) {
        if (openSubroutines.size) {
          if (hasBackrefs) {
            numCapturesPassedInsideThisSubroutine++;
            numCapturesPassedInsideSubroutines++;
            updateHiddenCaptureTracking(
              hiddenCaptures,
              addedHiddenCaptures,
              numCapturesPassedOutsideSubroutines + numCapturesPassedInsideSubroutines
            );
          }
          if (m !== "(") {
            expression = spliceStr(expression, index, m, subroutineWrapper);
            token4.lastIndex -= m.length - subroutineWrapper.length;
          }
        } else if (hasBackrefs) {
          captureNumMap.push(
            lastOf(captureNumMap) + 1 + numCapturesPassedInsideSubroutines - numSubroutineCapturesTrackedInRemap
          );
          numSubroutineCapturesTrackedInRemap = numCapturesPassedInsideSubroutines;
          numCapturesPassedOutsideSubroutines++;
        }
      } else if ((backrefNum || backrefName) && openSubroutines.size) {
        const num = backrefNum ? +backrefNum : namedGroups.get(backrefName)?.groupNum;
        let isGroupFromThisSubroutine = false;
        for (const s of openSubroutinesStack) {
          const group = namedGroups.get(s);
          if (num >= group.groupNum && num <= group.groupNum + group.numCaptures) {
            isGroupFromThisSubroutine = true;
            break;
          }
        }
        if (isGroupFromThisSubroutine) {
          const group = namedGroups.get(lastOf(openSubroutinesStack));
          const subroutineNum = numCapturesPassedOutsideSubroutines + numCapturesPassedInsideSubroutines - numCapturesPassedInsideThisSubroutine;
          const metadata = `\\k<$$b${num}s${subroutineNum}r${group.groupNum}c${group.numCaptures}>`;
          expression = spliceStr(expression, index, m, metadata);
          token4.lastIndex += metadata.length - m.length;
        }
      } else if (m === ")") {
        if (openSubroutines.size) {
          const subroutine = openSubroutines.get(lastOf(openSubroutinesStack));
          subroutine.unclosedGroupCount--;
          if (!subroutine.unclosedGroupCount) {
            openSubroutines.delete(openSubroutinesStack.pop());
          }
        }
      }
    } else if (m === "]") {
      numCharClassesOpen--;
    }
  }
  hiddenCaptures.push(...addedHiddenCaptures);
  if (hasBackrefs) {
    expression = replaceUnescaped(
      expression,
      String.raw`\\(?:(?<bNum>[1-9]\d*)|k<\$\$b(?<bNumSub>\d+)s(?<subNum>\d+)r(?<refNum>\d+)c(?<refCaps>\d+)>)`,
      ({ 0: m, groups: { bNum, bNumSub, subNum, refNum, refCaps } }) => {
        if (bNum) {
          const backrefNum = +bNum;
          if (backrefNum > captureNumMap.length - 1) {
            throw new Error(`Backref "${m}" greater than number of captures`);
          }
          return `\\${captureNumMap[backrefNum]}`;
        }
        const backrefNumInSubroutine = +bNumSub;
        const subroutineGroupNum = +subNum;
        const refGroupNum = +refNum;
        const numCapturesInRef = +refCaps;
        if (backrefNumInSubroutine < refGroupNum || backrefNumInSubroutine > refGroupNum + numCapturesInRef) {
          return `\\${captureNumMap[backrefNumInSubroutine]}`;
        }
        return `\\${subroutineGroupNum - refGroupNum + backrefNumInSubroutine}`;
      },
      Context.DEFAULT
    );
  }
  return {
    pattern: expression,
    hiddenCaptures
  };
}
var defineGroupToken = new RegExp(String.raw`${namedCapturingDelim}|\(\?:\)|(?<invalid>\\?.)`, "gsu");
function processDefinitionGroup(expression, namedGroups) {
  const defineMatch = execUnescaped(expression, String.raw`\(\?\(DEFINE\)`, 0, Context.DEFAULT);
  if (!defineMatch) {
    return expression;
  }
  const defineGroup = getGroup(expression, defineMatch);
  if (defineGroup.afterPos < expression.length) {
    throw new Error("DEFINE group allowed only at the end of a regex");
  } else if (defineGroup.afterPos > expression.length) {
    throw new Error("DEFINE group is unclosed");
  }
  let match;
  defineGroupToken.lastIndex = 0;
  while (match = defineGroupToken.exec(defineGroup.contents)) {
    const { captureName, invalid } = match.groups;
    if (captureName) {
      const group = getGroup(defineGroup.contents, match);
      let duplicateName;
      if (!namedGroups.get(captureName).isUnique) {
        duplicateName = captureName;
      } else {
        const nestedNamedGroups = getNamedCapturingGroups(group.contents, { includeContents: false });
        for (const name of nestedNamedGroups.keys()) {
          if (!namedGroups.get(name).isUnique) {
            duplicateName = name;
            break;
          }
        }
      }
      if (duplicateName) {
        throw new Error(`Duplicate group name "${duplicateName}" within DEFINE`);
      }
      defineGroupToken.lastIndex = group.afterPos;
    } else if (invalid) {
      throw new Error(`DEFINE group includes unsupported syntax at top level`);
    }
  }
  return expression.slice(0, defineMatch.index);
}
function countOpenParens(expression) {
  let num = 0;
  forEachUnescaped(expression, "\\(", () => num++, Context.DEFAULT);
  return num;
}
function getCaptureNum(expression, groupName) {
  let num = 0;
  let pos = 0;
  let match;
  while (match = execUnescaped(expression, capturingDelim, pos, Context.DEFAULT)) {
    const { 0: m, index, groups: { captureName } } = match;
    num++;
    if (captureName === groupName) {
      break;
    }
    pos = index + m.length;
  }
  return num;
}
function getGroup(expression, delimMatch) {
  const contentsStart = delimMatch.index + delimMatch[0].length;
  const contents = getGroupContents(expression, contentsStart);
  const afterPos = contentsStart + contents.length + 1;
  return {
    contents,
    afterPos
  };
}
function getNamedCapturingGroups(expression, { includeContents }) {
  const namedGroups = /* @__PURE__ */ new Map();
  forEachUnescaped(
    expression,
    namedCapturingDelim,
    ({ 0: m, index, groups: { captureName } }) => {
      if (namedGroups.has(captureName)) {
        namedGroups.get(captureName).isUnique = false;
      } else {
        const group = { isUnique: true };
        if (includeContents) {
          const contents = getGroupContents(expression, index + m.length);
          Object.assign(group, {
            contents,
            groupNum: getCaptureNum(expression, captureName),
            numCaptures: countCaptures(contents)
          });
        }
        namedGroups.set(captureName, group);
      }
    },
    Context.DEFAULT
  );
  return namedGroups;
}
function lastOf(arr) {
  return arr[arr.length - 1];
}
function updateHiddenCaptureTracking(hiddenCaptures, addedHiddenCaptures, addedCaptureNum) {
  addedHiddenCaptures.push(addedCaptureNum);
  incrementIfAtLeast(hiddenCaptures, addedCaptureNum);
}

// src/regex.js
var regex = (first, ...substitutions) => {
  if (Array.isArray(first?.raw)) {
    return regexFromTemplate({}, first, ...substitutions);
  } else if ((typeof first === "string" || first === void 0) && !substitutions.length) {
    return regexFromTemplate.bind(null, { flags: first ?? "" });
  } else if ({}.toString.call(first) === "[object Object]" && !substitutions.length) {
    return regexFromTemplate.bind(null, first);
  }
  throw new Error(`Unexpected arguments: ${JSON.stringify([first, ...substitutions])}`);
};
var regexFromTemplate = (options, template, ...substitutions) => {
  const opts = getOptions(options);
  const prepped = runPreprocessors(template, substitutions, opts);
  let precedingCaptures = 0;
  let expression = "";
  let runningContext;
  prepped.template.raw.forEach((raw, i) => {
    const wrapEscapedStr = !!(prepped.template.raw[i] || prepped.template.raw[i + 1]);
    precedingCaptures += countCaptures(raw);
    expression += sandboxUnsafeNulls(raw, Context.CHAR_CLASS);
    runningContext = getEndContextForIncompleteExpression(expression, runningContext);
    const { regexContext, charClassContext } = runningContext;
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
    return opts.subclass ? new RegExpSubclass(expression, opts.flags, { hiddenCaptures: plugged.hiddenCaptures }) : new RegExp(expression, opts.flags);
  } catch (err) {
    const stripped = err.message.replace(/ \/.+\/[a-z]*:/, "");
    err.message = `${stripped}: /${expression}/${opts.flags}`;
    throw err;
  }
};
function rewrite(expression = "", options) {
  const opts = getOptions(options);
  if (opts.subclass) {
    throw new Error("Cannot use option subclass");
  }
  return {
    // NOTE: Since `pattern` is a Regex+ export with special meaning, the term `expression` is used
    // in code to refer to regex source strings, except in the public API
    pattern: runPlugins(
      runPreprocessors({ raw: [expression] }, [], opts).template.raw[0],
      opts
    ).pattern,
    flags: opts.flags
  };
}
function getOptions(options) {
  const opts = {
    flags: "",
    subclass: false,
    plugins: [],
    unicodeSetsPlugin: backcompatPlugin,
    disable: {
      /* n, v, x, atomic, subroutines */
    },
    force: {
      /* v */
    },
    ...options
  };
  if (/[nuvx]/.test(opts.flags)) {
    throw new Error("Implicit flags v/u/x/n cannot be explicitly added");
  }
  const useFlagV = opts.force.v || (opts.disable.v ? false : envSupportsFlagV);
  opts.flags += useFlagV ? "v" : "u";
  if (useFlagV) {
    opts.unicodeSetsPlugin = null;
  }
  return opts;
}
function runPreprocessors(template, substitutions, options) {
  const preprocessors = [];
  if (!options.disable.x) {
    preprocessors.push(flagXPreprocessor);
  }
  if (!options.disable.n) {
    preprocessors.push(flagNPreprocessor);
  }
  for (const pp of preprocessors) {
    ({ template, substitutions } = preprocess(template, substitutions, pp, options));
  }
  return {
    template,
    substitutions
  };
}
function runPlugins(expression, { flags, plugins, unicodeSetsPlugin, disable }) {
  let hiddenCaptures = [];
  [
    ...plugins,
    // Run first, so provided plugins can output extended syntax
    ...disable.subroutines ? [] : [subroutines],
    ...disable.atomic ? [] : [possessive, atomic],
    ...disable.x ? [] : [clean],
    // Run last, so it doesn't have to worry about parsing extended syntax
    ...!unicodeSetsPlugin ? [] : [unicodeSetsPlugin]
  ].forEach((plugin) => {
    const result = plugin(expression, { flags, hiddenCaptures });
    if (typeof result?.pattern !== "string") {
      throw new Error('Plugin must return an object with a string property "pattern"');
    }
    expression = result.pattern;
    if (result.hiddenCaptures) {
      hiddenCaptures = result.hiddenCaptures;
    }
  });
  return {
    pattern: expression,
    hiddenCaptures
  };
}
function interpolate(value, flags, regexContext, charClassContext, wrapEscapedStr, precedingCaptures) {
  if (value instanceof RegExp && regexContext !== RegexContext.DEFAULT) {
    throw new Error("Cannot interpolate a RegExp at this position because the syntax context does not match");
  }
  if (regexContext === RegexContext.INVALID_INCOMPLETE_TOKEN || charClassContext === CharClassContext.INVALID_INCOMPLETE_TOKEN) {
    throw new Error("Interpolation preceded by invalid incomplete token");
  }
  if (typeof value === "number" && (regexContext === RegexContext.ENCLOSED_U || charClassContext === CharClassContext.ENCLOSED_U)) {
    return value.toString(16);
  }
  const isPattern = value instanceof Pattern;
  let escapedValue = "";
  if (!(value instanceof RegExp)) {
    value = String(value);
    if (!isPattern) {
      escapedValue = escapeV(
        value,
        regexContext === RegexContext.CHAR_CLASS ? Context.CHAR_CLASS : Context.DEFAULT
      );
    }
    const breakoutChar = getBreakoutChar(escapedValue || value, regexContext, charClassContext);
    if (breakoutChar) {
      throw new Error(`Unescaped stray "${breakoutChar}" in the interpolated value would have side effects outside it`);
    }
  }
  if (regexContext === RegexContext.INTERVAL_QUANTIFIER || regexContext === RegexContext.GROUP_NAME || enclosedTokenRegexContexts.has(regexContext) || enclosedTokenCharClassContexts.has(charClassContext)) {
    return isPattern ? String(value) : escapedValue;
  } else if (regexContext === RegexContext.CHAR_CLASS) {
    if (isPattern) {
      if (hasUnescaped(String(value), "^-|^&&|-$|&&$")) {
        throw new Error("Cannot use range or set operator at boundary of interpolated pattern; move the operation into the pattern or the operator outside of it");
      }
      const sandboxedValue = sandboxLoneCharClassCaret(sandboxLoneDoublePunctuatorChar(value));
      return containsCharClassUnion(value) ? `[${sandboxedValue}]` : sandboxUnsafeNulls(sandboxedValue);
    }
    return containsCharClassUnion(escapedValue) ? `[${escapedValue}]` : escapedValue;
  }
  if (value instanceof RegExp) {
    const transformed = transformForLocalFlags(value, flags);
    const backrefsAdjusted = adjustNumberedBackrefs(transformed.value, precedingCaptures);
    return transformed.usedModifier ? backrefsAdjusted : `(?:${backrefsAdjusted})`;
  }
  if (isPattern) {
    return `(?:${value})`;
  }
  return wrapEscapedStr ? `(?:${escapedValue})` : escapedValue;
}
function transformForLocalFlags(re, outerFlags) {
  const modFlagsObj = {
    i: null,
    m: null,
    s: null
  };
  const newlines = "\\n\\r\\u2028\\u2029";
  let value = re.source;
  if (re.ignoreCase !== outerFlags.includes("i")) {
    if (envSupportsFlagGroups) {
      modFlagsObj.i = re.ignoreCase;
    } else {
      throw new Error("Pattern modifiers not supported, so flag i on the outer and interpolated regex must match");
    }
  }
  if (re.dotAll !== outerFlags.includes("s")) {
    if (envSupportsFlagGroups) {
      modFlagsObj.s = re.dotAll;
    } else {
      value = replaceUnescaped(value, "\\.", re.dotAll ? "[^]" : `[^${newlines}]`, Context.DEFAULT);
    }
  }
  if (re.multiline !== outerFlags.includes("m")) {
    if (envSupportsFlagGroups) {
      modFlagsObj.m = re.multiline;
    } else {
      value = replaceUnescaped(value, "\\^", re.multiline ? `(?<=^|[${newlines}])` : "(?<![^])", Context.DEFAULT);
      value = replaceUnescaped(value, "\\$", re.multiline ? `(?=$|[${newlines}])` : "(?![^])", Context.DEFAULT);
    }
  }
  if (envSupportsFlagGroups) {
    const keys = Object.keys(modFlagsObj);
    let modifier = keys.filter((k) => modFlagsObj[k] === true).join("");
    const modOff = keys.filter((k) => modFlagsObj[k] === false).join("");
    if (modOff) {
      modifier += `-${modOff}`;
    }
    if (modifier) {
      return {
        value: `(?${modifier}:${value})`,
        usedModifier: true
      };
    }
  }
  return { value };
}
//# sourceMappingURL=regex.js.map
