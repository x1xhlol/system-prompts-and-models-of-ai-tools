import {doublePunctuatorChars} from './utils.js';

const incompatibleEscapeChars = '&!#%,:;<=>@`~';
const token = new RegExp(String.raw`
\[\^?-?
| --?\]
| (?<dp>[${doublePunctuatorChars}])\k<dp>
| --
| \\(?<vOnlyEscape>[${incompatibleEscapeChars}])
| \\[pPu]\{[^}]+\}
| \\?.
`.replace(/\s+/g, ''), 'gsu');

/**
Applies flag v rules when using flag u, for forward compatibility.
Assumes flag u and doesn't worry about syntax errors that are caught by it.
@param {string} expression
@returns {import('./regex.js').PluginResult}
*/
function backcompatPlugin(expression) {
  const unescapedLiteralHyphenMsg = 'Invalid unescaped "-" in character class';
  let inCharClass = false;
  let result = '';
  for (const {0: m, groups: {dp, vOnlyEscape}} of expression.matchAll(token)) {
    if (m[0] === '[') {
      if (inCharClass) {
        throw new Error('Invalid nested character class when flag v not supported; possibly from interpolation');
      }
      if (m.endsWith('-')) {
        throw new Error(unescapedLiteralHyphenMsg);
      }
      inCharClass = true;
    } else if (m.endsWith(']')) {
      if (m[0] === '-') {
        throw new Error(unescapedLiteralHyphenMsg);
      }
      inCharClass = false;
    } else if (inCharClass) {
      if (m === '&&' || m === '--') {
        throw new Error(`Invalid set operator "${m}" when flag v not supported`);
      } else if (dp) {
        throw new Error(`Invalid double punctuator "${m}", reserved by flag v`);
      } else if ('(){}/|'.includes(m)) {
        throw new Error(`Invalid unescaped "${m}" in character class`);
      } else if (vOnlyEscape) {
        // Remove the escaping backslash to emulate flag v rules, since this character is allowed
        // to be escaped within character classes with flag v but not with flag u
        result += vOnlyEscape;
        continue;
      }
    }
    result += m;
  }
  return {
    pattern: result,
  };
}

export {
  backcompatPlugin,
};
