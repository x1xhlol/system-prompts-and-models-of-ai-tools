import {incrementIfAtLeast, noncapturingDelim, spliceStr} from './utils-internals.js';
import {Context, replaceUnescaped} from 'regex-utilities';

const atomicPluginToken = new RegExp(String.raw`(?<noncapturingStart>${noncapturingDelim})|(?<capturingStart>\((?:\?<[^>]+>)?)|\\?.`, 'gsu');

/**
Apply transformations for atomic groups: `(?>…)`.
@param {string} expression
@param {import('./regex.js').PluginData} [data]
@returns {Required<import('./regex.js').PluginResult>}
*/
function atomic(expression, data) {
  const hiddenCaptures = data?.hiddenCaptures ?? [];
  // Capture transfer is used by <github.com/slevithan/oniguruma-to-es>
  let captureTransfers = data?.captureTransfers ?? new Map();
  if (!/\(\?>/.test(expression)) {
    return {
      pattern: expression,
      captureTransfers,
      hiddenCaptures,
    };
  }

  const aGDelim = '(?>';
  const emulatedAGDelim = '(?:(?=(';
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
      const {0: m, index, groups: {capturingStart, noncapturingStart}} = match;
      if (m === '[') {
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
        } else if (m === ')' && inAG) {
          if (!numGroupsOpenInAG) {
            numAGs++;
            const addedCaptureNum = numCapturesBeforeAG + numAGs;
            // Replace `expression` and use `<$$N>` as a temporary wrapper for the backref so it
            // can avoid backref renumbering afterward. Wrap the whole substitution (including the
            // lookahead and following backref) in a noncapturing group to handle following
            // quantifiers and literal digits
            expression = `${expression.slice(0, aGPos)}${emulatedAGDelim}${
                expression.slice(aGPos + aGDelim.length, index)
              }))<$$${addedCaptureNum}>)${expression.slice(index + 1)}`;
            hasProcessedAG = true;
            addedHiddenCaptures.push(addedCaptureNum);
            incrementIfAtLeast(hiddenCaptures, addedCaptureNum);
            if (captureTransfers.size) {
              const newCaptureTransfers = new Map();
              captureTransfers.forEach((from, to) => {
                newCaptureTransfers.set(
                  to >= addedCaptureNum ? to + 1 : to,
                  from.map(f => f >= addedCaptureNum ? f + 1 : f)
                );
              });
              captureTransfers = newCaptureTransfers;
            }
            break;
          }
          numGroupsOpenInAG--;
        }

      } else if (m === ']') {
        numCharClassesOpen--;
      }
    }
  // Start over from the beginning of the atomic group's contents, in case the processed group
  // contains additional atomic groups
  } while (hasProcessedAG);

  hiddenCaptures.push(...addedHiddenCaptures);

  // Second pass to adjust numbered backrefs
  expression = replaceUnescaped(
    expression,
    String.raw`\\(?<backrefNum>[1-9]\d*)|<\$\$(?<wrappedBackrefNum>\d+)>`,
    ({0: m, groups: {backrefNum, wrappedBackrefNum}}) => {
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
    hiddenCaptures,
  };
}

const baseQuantifier = String.raw`(?:[?*+]|\{\d+(?:,\d*)?\})`;
// Complete tokenizer for base syntax; doesn't (need to) know about character-class-only syntax
const possessivePluginToken = new RegExp(String.raw`
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
`.replace(/\s+/g, ''), 'gsu');

/**
Transform posessive quantifiers into atomic groups. The posessessive quantifiers are:
`?+`, `*+`, `++`, `{N}+`, `{N,}+`, `{N,N}+`.
This follows Java, PCRE, Perl, and Python.
Possessive quantifiers in Oniguruma and Onigmo are only: `?+`, `*+`, `++`.
@param {string} expression
@returns {import('./regex.js').PluginResult}
*/
function possessive(expression) {
  if (!(new RegExp(`${baseQuantifier}\\+`).test(expression))) {
    return {
      pattern: expression,
    };
  }

  const openGroupIndices = [];
  let lastGroupIndex = null;
  let lastCharClassIndex = null;
  let lastToken = '';
  let numCharClassesOpen = 0;
  let match;
  possessivePluginToken.lastIndex = 0;
  while (match = possessivePluginToken.exec(expression)) {
    const {0: m, index, groups: {qBase, qMod, invalidQ}} = match;
    if (m === '[') {
      if (!numCharClassesOpen) {
        lastCharClassIndex = index;
      }
      numCharClassesOpen++;
    } else if (m === ']') {
      if (numCharClassesOpen) {
        numCharClassesOpen--;
      // Unmatched `]`
      } else {
        lastCharClassIndex = null;
      }
    } else if (!numCharClassesOpen) {

      if (qMod === '+' && lastToken && !lastToken.startsWith('(')) {
        // Invalid following quantifier would become valid via the wrapping group
        if (invalidQ) {
          throw new Error(`Invalid quantifier "${m}"`);
        }
        let charsAdded = -1; // -1 for removed trailing `+`
        // Possessivizing fixed repetition quantifiers like `{2}` does't change their behavior, so
        // avoid doing so (convert them to greedy)
        if (/^\{\d+\}$/.test(qBase)) {
          expression = spliceStr(expression, index + qBase.length, qMod, '');
        } else {
          if (lastToken === ')' || lastToken === ']') {
            const nodeIndex = lastToken === ')' ? lastGroupIndex : lastCharClassIndex;
            // Unmatched `)` would break out of the wrapping group and mess with handling.
            // Unmatched `]` wouldn't be a problem, but it's unnecessary to have dedicated support
            // for unescaped `]++` since this won't work with flag u or v anyway
            if (nodeIndex === null) {
              throw new Error(`Invalid unmatched "${lastToken}"`);
            }
            expression = `${expression.slice(0, nodeIndex)}(?>${expression.slice(nodeIndex, index)}${qBase})${expression.slice(index + m.length)}`;
          } else {
            expression = `${expression.slice(0, index - lastToken.length)}(?>${lastToken}${qBase})${expression.slice(index + m.length)}`;
          }
          charsAdded += 4; // `(?>)`
        }
        possessivePluginToken.lastIndex += charsAdded;
      } else if (m[0] === '(') {
        openGroupIndices.push(index);
      } else if (m === ')') {
        lastGroupIndex = openGroupIndices.length ? openGroupIndices.pop() : null;
      }

    }
    lastToken = m;
  }

  return {
    pattern: expression,
  };
}

export {
  atomic,
  possessive,
};
