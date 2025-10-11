import {getEndContextForIncompleteExpression, RegexContext} from './utils.js';
import {noncapturingDelim} from './utils-internals.js';

const token = new RegExp(String.raw`
${noncapturingDelim}
| \(\?<
| (?<backrefNum>\\[1-9]\d*)
| \\?.
`.replace(/\s+/g, ''), 'gsu');

/**
Apply transformations for flag n (named capture only).

Preprocessors are applied to the outer regex and interpolated patterns, but not interpolated
regexes or strings.
@type {import('./utils.js').Preprocessor}
*/
function flagNPreprocessor(value, runningContext) {
  value = String(value);
  let expression = '';
  let transformed = '';
  for (const {0: m, groups: {backrefNum}} of value.matchAll(token)) {
    expression += m;
    runningContext = getEndContextForIncompleteExpression(expression, runningContext);
    const {regexContext} = runningContext;
    if (regexContext === RegexContext.DEFAULT) {
      if (m === '(') {
        transformed += '(?:';
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
    runningContext,
  };
}

export {
  flagNPreprocessor,
};
