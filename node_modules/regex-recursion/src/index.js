import {Context, forEachUnescaped, getGroupContents, hasUnescaped, replaceUnescaped} from 'regex-utilities';

const r = String.raw;
const gRToken = r`\\g<(?<gRNameOrNum>[^>&]+)&R=(?<gRDepth>[^>]+)>`;
const recursiveToken = r`\(\?R=(?<rDepth>[^\)]+)\)|${gRToken}`;
const namedCaptureDelim = r`\(\?<(?![=!])(?<captureName>[^>]+)>`;
const captureDelim = r`${namedCaptureDelim}|(?<unnamed>\()(?!\?)`;
const token = new RegExp(r`${namedCaptureDelim}|${recursiveToken}|\(\?|\\?.`, 'gsu');
const overlappingRecursionMsg = 'Cannot use multiple overlapping recursions';

/**
@param {string} pattern
@param {{
  flags?: string;
  captureTransfers?: Map<number, Array<number>>;
  hiddenCaptures?: Array<number>;
  mode?: 'plugin' | 'external';
}} [data]
@returns {{
  pattern: string;
  captureTransfers: Map<number, Array<number>>;
  hiddenCaptures: Array<number>;
}}
*/
function recursion(pattern, data) {
  const {hiddenCaptures, mode} = {
    hiddenCaptures: [],
    mode: 'plugin',
    ...data,
  };
  // Capture transfer is used by <github.com/slevithan/oniguruma-to-es>
  let captureTransfers = data?.captureTransfers ?? new Map();
  // Keep the initial fail-check (which avoids unneeded processing) as fast as possible by testing
  // without the accuracy improvement of using `hasUnescaped` with `Context.DEFAULT`
  if (!(new RegExp(recursiveToken, 'su').test(pattern))) {
    return {
      pattern,
      captureTransfers,
      hiddenCaptures,
    };
  }
  if (mode === 'plugin' && hasUnescaped(pattern, r`\(\?\(DEFINE\)`, Context.DEFAULT)) {
    throw new Error('DEFINE groups cannot be used with recursion');
  }

  const addedHiddenCaptures = [];
  const hasNumberedBackref = hasUnescaped(pattern, r`\\[1-9]`, Context.DEFAULT);
  const groupContentsStartPos = new Map();
  const openGroups = [];
  let hasRecursed = false;
  let numCharClassesOpen = 0;
  let numCapturesPassed = 0;
  let match;
  token.lastIndex = 0;
  while ((match = token.exec(pattern))) {
    const {0: m, groups: {captureName, rDepth, gRNameOrNum, gRDepth}} = match;
    if (m === '[') {
      numCharClassesOpen++;
    } else if (!numCharClassesOpen) {

      // `(?R=N)`
      if (rDepth) {
        assertMaxInBounds(rDepth);
        if (hasRecursed) {
          throw new Error(overlappingRecursionMsg);
        }
        if (hasNumberedBackref) {
          // Could add support for numbered backrefs with extra effort, but it's probably not worth
          // it. To trigger this error, the regex must include recursion and one of the following:
          // - An interpolated regex that contains a numbered backref (since other numbered
          //   backrefs are prevented by implicit flag n).
          // - A numbered backref, when flag n is explicitly disabled.
          // Note that Regex+'s extended syntax (atomic groups and sometimes subroutines) can also
          // add numbered backrefs, but those work fine because external plugins like this one run
          // *before* the transformation of built-in syntax extensions
          throw new Error(
            // When used in `external` mode by transpilers other than Regex+, backrefs might have
            // gone through conversion from named to numbered, so avoid a misleading error
            `${mode === 'external' ? 'Backrefs' : 'Numbered backrefs'} cannot be used with global recursion`
          );
        }
        const left = pattern.slice(0, match.index);
        const right = pattern.slice(token.lastIndex);
        if (hasUnescaped(right, recursiveToken, Context.DEFAULT)) {
          throw new Error(overlappingRecursionMsg);
        }
        const reps = +rDepth - 1;
        pattern = makeRecursive(
          left,
          right,
          reps,
          false,
          hiddenCaptures,
          addedHiddenCaptures,
          numCapturesPassed
        );
        captureTransfers = mapCaptureTransfers(
          captureTransfers,
          left,
          reps,
          addedHiddenCaptures.length,
          0,
          numCapturesPassed
        );
        // No need to parse further
        break;
      // `\g<name&R=N>`, `\g<number&R=N>`
      } else if (gRNameOrNum) {
        assertMaxInBounds(gRDepth);
        let isWithinReffedGroup = false;
        for (const g of openGroups) {
          if (g.name === gRNameOrNum || g.num === +gRNameOrNum) {
            isWithinReffedGroup = true;
            if (g.hasRecursedWithin) {
              throw new Error(overlappingRecursionMsg);
            }
            break;
          }
        }
        if (!isWithinReffedGroup) {
          throw new Error(r`Recursive \g cannot be used outside the referenced group "${
            mode === 'external' ? gRNameOrNum : r`\g<${gRNameOrNum}&R=${gRDepth}>`
          }"`);
        }
        const startPos = groupContentsStartPos.get(gRNameOrNum);
        const groupContents = getGroupContents(pattern, startPos);
        if (
          hasNumberedBackref &&
          hasUnescaped(groupContents, r`${namedCaptureDelim}|\((?!\?)`, Context.DEFAULT)
        ) {
          throw new Error(
            // When used in `external` mode by transpilers other than Regex+, backrefs might have
            // gone through conversion from named to numbered, so avoid a misleading error
            `${mode === 'external' ? 'Backrefs' : 'Numbered backrefs'} cannot be used with recursion of capturing groups`
          );
        }
        const groupContentsLeft = pattern.slice(startPos, match.index);
        const groupContentsRight = groupContents.slice(groupContentsLeft.length + m.length);
        const numAddedHiddenCapturesPreExpansion = addedHiddenCaptures.length;
        const reps = +gRDepth - 1;
        const expansion = makeRecursive(
          groupContentsLeft,
          groupContentsRight,
          reps,
          true,
          hiddenCaptures,
          addedHiddenCaptures,
          numCapturesPassed
        );
        captureTransfers = mapCaptureTransfers(
          captureTransfers,
          groupContentsLeft,
          reps,
          addedHiddenCaptures.length - numAddedHiddenCapturesPreExpansion,
          numAddedHiddenCapturesPreExpansion,
          numCapturesPassed
        );
        const pre = pattern.slice(0, startPos);
        const post = pattern.slice(startPos + groupContents.length);
        // Modify the string we're looping over
        pattern = `${pre}${expansion}${post}`;
        // Step forward for the next loop iteration
        token.lastIndex += expansion.length - m.length - groupContentsLeft.length - groupContentsRight.length;
        openGroups.forEach(g => g.hasRecursedWithin = true);
        hasRecursed = true;
      } else if (captureName) {
        numCapturesPassed++;
        groupContentsStartPos.set(String(numCapturesPassed), token.lastIndex);
        groupContentsStartPos.set(captureName, token.lastIndex);
        openGroups.push({
          num: numCapturesPassed,
          name: captureName,
        });
      } else if (m[0] === '(') {
        const isUnnamedCapture = m === '(';
        if (isUnnamedCapture) {
          numCapturesPassed++;
          groupContentsStartPos.set(String(numCapturesPassed), token.lastIndex);
        }
        openGroups.push(isUnnamedCapture ? {num: numCapturesPassed} : {});
      } else if (m === ')') {
        openGroups.pop();
      }

    } else if (m === ']') {
      numCharClassesOpen--;
    }
  }

  hiddenCaptures.push(...addedHiddenCaptures);

  return {
    pattern,
    captureTransfers,
    hiddenCaptures,
  };
}

/**
@param {string} max
*/
function assertMaxInBounds(max) {
  const errMsg = `Max depth must be integer between 2 and 100; used ${max}`;
  if (!/^[1-9]\d*$/.test(max)) {
    throw new Error(errMsg);
  }
  max = +max;
  if (max < 2 || max > 100) {
    throw new Error(errMsg);
  }
}

/**
@param {string} left
@param {string} right
@param {number} reps
@param {boolean} isSubpattern
@param {Array<number>} hiddenCaptures
@param {Array<number>} addedHiddenCaptures
@param {number} numCapturesPassed
@returns {string}
*/
function makeRecursive(
  left,
  right,
  reps,
  isSubpattern,
  hiddenCaptures,
  addedHiddenCaptures,
  numCapturesPassed
) {
  const namesInRecursed = new Set();
  // Can skip this work if not needed
  if (isSubpattern) {
    forEachUnescaped(left + right, namedCaptureDelim, ({groups: {captureName}}) => {
      namesInRecursed.add(captureName);
    }, Context.DEFAULT);
  }
  const rest = [
    reps,
    isSubpattern ? namesInRecursed : null,
    hiddenCaptures,
    addedHiddenCaptures,
    numCapturesPassed,
  ];
  // Depth 2: 'left(?:left(?:)right)right'
  // Depth 3: 'left(?:left(?:left(?:)right)right)right'
  // Empty group in the middle separates tokens and absorbs a following quantifier if present
  return `${left}${
    repeatWithDepth(`(?:${left}`, 'forward', ...rest)
  }(?:)${
    repeatWithDepth(`${right})`, 'backward', ...rest)
  }${right}`;
}

/**
@param {string} pattern
@param {'forward' | 'backward'} direction
@param {number} reps
@param {Set<string> | null} namesInRecursed
@param {Array<number>} hiddenCaptures
@param {Array<number>} addedHiddenCaptures
@param {number} numCapturesPassed
@returns {string}
*/
function repeatWithDepth(
  pattern,
  direction,
  reps,
  namesInRecursed,
  hiddenCaptures,
  addedHiddenCaptures,
  numCapturesPassed
) {
  const startNum = 2;
  const getDepthNum = i => direction === 'forward' ? (i + startNum) : (reps - i + startNum - 1);
  let result = '';
  for (let i = 0; i < reps; i++) {
    const depthNum = getDepthNum(i);
    result += replaceUnescaped(
      pattern,
      r`${captureDelim}|\\k<(?<backref>[^>]+)>`,
      ({0: m, groups: {captureName, unnamed, backref}}) => {
        if (backref && namesInRecursed && !namesInRecursed.has(backref)) {
          // Don't alter backrefs to groups outside the recursed subpattern
          return m;
        }
        const suffix = `_$${depthNum}`;
        if (unnamed || captureName) {
          const addedCaptureNum = numCapturesPassed + addedHiddenCaptures.length + 1;
          addedHiddenCaptures.push(addedCaptureNum);
          incrementIfAtLeast(hiddenCaptures, addedCaptureNum);
          return unnamed ? m : `(?<${captureName}${suffix}>`;
        }
        return r`\k<${backref}${suffix}>`;
      },
      Context.DEFAULT
    );
  }
  return result;
}

/**
Updates the array in place by incrementing each value greater than or equal to the threshold.
@param {Array<number>} arr
@param {number} threshold
*/
function incrementIfAtLeast(arr, threshold) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] >= threshold) {
      arr[i]++;
    }
  }
}

/**
@param {Map<number, Array<number>>} captureTransfers
@param {string} left
@param {number} reps
@param {number} numCapturesAddedInExpansion
@param {number} numAddedHiddenCapturesPreExpansion
@param {number} numCapturesPassed
@returns {Map<number, Array<number>>}
*/
function mapCaptureTransfers(captureTransfers, left, reps, numCapturesAddedInExpansion, numAddedHiddenCapturesPreExpansion, numCapturesPassed) {
  if (captureTransfers.size && numCapturesAddedInExpansion) {
    let numCapturesInLeft = 0;
    forEachUnescaped(left, captureDelim, () => numCapturesInLeft++, Context.DEFAULT);
    // Is 0 for global recursion
    const recursionDelimCaptureNum = numCapturesPassed - numCapturesInLeft + numAddedHiddenCapturesPreExpansion;
    const newCaptureTransfers = new Map();
    captureTransfers.forEach((from, to) => {
      const numCapturesInRight = (numCapturesAddedInExpansion - (numCapturesInLeft * reps)) / reps;
      const numCapturesAddedInLeft = numCapturesInLeft * reps;
      const newTo = to > (recursionDelimCaptureNum + numCapturesInLeft) ? to + numCapturesAddedInExpansion : to;
      const newFrom = [];
      for (const f of from) {
        // Before the recursed subpattern
        if (f <= recursionDelimCaptureNum) {
          newFrom.push(f);
        // After the recursed subpattern
        } else if (f > (recursionDelimCaptureNum + numCapturesInLeft + numCapturesInRight)) {
          newFrom.push(f + numCapturesAddedInExpansion);
        // Within the recursed subpattern, on the left of the recursion token
        } else if (f <= (recursionDelimCaptureNum + numCapturesInLeft)) {
          for (let i = 0; i <= reps; i++) {
            newFrom.push(f + (numCapturesInLeft * i));
          }
        // Within the recursed subpattern, on the right of the recursion token
        } else {
          for (let i = 0; i <= reps; i++) {
            newFrom.push(f + numCapturesAddedInLeft + (numCapturesInRight * i));
          }
        }
      }
      newCaptureTransfers.set(newTo, newFrom);
    });
    return newCaptureTransfers;
  }
  return captureTransfers;
}

export {
  recursion,
};
