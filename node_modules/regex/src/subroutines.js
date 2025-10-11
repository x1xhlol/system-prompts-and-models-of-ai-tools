import {capturingDelim, countCaptures, namedCapturingDelim} from './utils.js';
import {incrementIfAtLeast, spliceStr} from './utils-internals.js';
import {Context, execUnescaped, forEachUnescaped, getGroupContents, hasUnescaped, replaceUnescaped} from 'regex-utilities';

/**
@param {string} expression
@param {import('./regex.js').PluginData} [data]
@returns {import('./regex.js').PluginResult}
*/
function subroutines(expression, data) {
  // NOTE: subroutines and definition groups fully support numbered backreferences and unnamed
  // captures (from interpolated regexes or from turning implicit flag n off), and all of the
  // complex forward and backward backreference adjustments that can result
  const namedGroups = getNamedCapturingGroups(expression, {includeContents: true});
  const transformed = processSubroutines(expression, namedGroups, data?.hiddenCaptures ?? []);
  return {
    pattern: processDefinitionGroup(transformed.pattern, namedGroups),
    hiddenCaptures: transformed.hiddenCaptures,
  };
}

// Explicitly exclude `&` from subroutine name chars because it's used by extension
// `regex-recursion` for recursive subroutines via `\g<name&R=N>`
const subroutinePattern = String.raw`\\g<(?<subroutineName>[^>&]+)>`;
const token = new RegExp(String.raw`
${subroutinePattern}
| (?<capturingStart>${capturingDelim})
| \\(?<backrefNum>[1-9]\d*)
| \\k<(?<backrefName>[^>]+)>
| \\?.
`.replace(/\s+/g, ''), 'gsu');

/**
@typedef {
  Map<string, {
    isUnique: boolean;
    contents?: string;
    groupNum?: number;
    numCaptures?: number;
  }>} NamedCapturingGroupsMap
*/
/**
Apply transformations for subroutines: `\g<name>`.
@param {string} expression
@param {NamedCapturingGroupsMap} namedGroups
@param {Array<number>} hiddenCaptures
@returns {import('./regex.js').PluginResult}
*/
function processSubroutines(expression, namedGroups, hiddenCaptures) {
  if (!/\\g</.test(expression)) {
    return {
      pattern: expression,
      hiddenCaptures,
    };
  }

  // Can skip a lot of processing and avoid adding captures if there are no backrefs
  const hasBackrefs = hasUnescaped(expression, '\\\\(?:[1-9]|k<[^>]+>)', Context.DEFAULT);
  const subroutineWrapper = hasBackrefs ? '(' : '(?:';
  const openSubroutines = new Map();
  const openSubroutinesStack = [];
  const captureNumMap = [0];
  const addedHiddenCaptures = [];
  let numCapturesPassedOutsideSubroutines = 0;
  let numCapturesPassedInsideSubroutines = 0;
  let numCapturesPassedInsideThisSubroutine = 0;
  let numSubroutineCapturesTrackedInRemap = 0;
  let numCharClassesOpen = 0;
  let match;
  token.lastIndex = 0;
  while (match = token.exec(expression)) {
    const {0: m, index, groups: {subroutineName, capturingStart, backrefNum, backrefName}} = match;
    if (m === '[') {
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
        // Wrap value in case it has top-level alternation or is followed by a quantifier. The
        // wrapper also marks the end of the expanded contents, which we'll track using
        // `unclosedGroupCount`. If there are any backrefs in the expression, wrap with `()`
        // instead of `(?:)` in case there are backrefs inside the subroutine that refer to their
        // containing capturing group
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
          unclosedGroupCount: countOpenParens(subroutineValue),
        });
        openSubroutinesStack.push(subroutineName);
        // Expand the subroutine's contents into the pattern we're looping over
        expression = spliceStr(expression, index, m, subroutineValue);
        token.lastIndex -= m.length - subroutineWrapper.length;
      } else if (capturingStart) {
        // Somewhere within an expanded subroutine
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
          // Named capturing group
          if (m !== '(') {
            // Replace named with unnamed capture. Subroutines ideally wouldn't create any new
            // captures, but it can't be helped since we need any backrefs to this capture to work.
            // Given that flag n prevents unnamed capture and thereby requires you to rely on named
            // backrefs and `groups`, switching to unnamed essentially accomplishes not creating a
            // capture. Can fully avoid capturing if there are no backrefs in the expression
            expression = spliceStr(expression, index, m, subroutineWrapper);
            token.lastIndex -= m.length - subroutineWrapper.length;
          }
        } else if (hasBackrefs) {
          captureNumMap.push(
            lastOf(captureNumMap) + 1 +
            numCapturesPassedInsideSubroutines -
            numSubroutineCapturesTrackedInRemap
          );
          numSubroutineCapturesTrackedInRemap = numCapturesPassedInsideSubroutines;
          numCapturesPassedOutsideSubroutines++;
        }
      } else if ((backrefNum || backrefName) && openSubroutines.size) {
        // Unify handling for named and unnamed by always using the backref num
        const num = backrefNum ? +backrefNum : namedGroups.get(backrefName)?.groupNum;
        let isGroupFromThisSubroutine = false;
        // Search for the group in the contents of the subroutine stack
        for (const s of openSubroutinesStack) {
          const group = namedGroups.get(s);
          if (num >= group.groupNum && num <= (group.groupNum + group.numCaptures)) {
            isGroupFromThisSubroutine = true;
            break;
          }
        }
        if (isGroupFromThisSubroutine) {
          const group = namedGroups.get(lastOf(openSubroutinesStack));
          // Replace the backref with metadata we'll need to rewrite it later, using
          // `\k<$$bNsNrNcN>` as a temporary wrapper:
          // - b: The unmodified matched backref num, or the corresponding num of a named backref
          // - s: The capture num of the subroutine we're most deeply nested in, including captures
          //      added by expanding the contents of preceding subroutines
          // - r: The original capture num of the group that the subroutine we're most deeply
          //      nested in references, not counting the effects of subroutines
          // - c: The number of captures within `r`, not counting the effects of subroutines
          const subroutineNum = numCapturesPassedOutsideSubroutines + numCapturesPassedInsideSubroutines - numCapturesPassedInsideThisSubroutine;
          const metadata = `\\k<$$b${num}s${subroutineNum}r${group.groupNum}c${group.numCaptures}>`;
          expression = spliceStr(expression, index, m, metadata);
          token.lastIndex += metadata.length - m.length;
        }
      } else if (m === ')') {
        if (openSubroutines.size) {
          const subroutine = openSubroutines.get(lastOf(openSubroutinesStack));
          subroutine.unclosedGroupCount--;
          if (!subroutine.unclosedGroupCount) {
            openSubroutines.delete(openSubroutinesStack.pop());
          }
        }
      }

    } else if (m === ']') {
      numCharClassesOpen--;
    }
  }

  hiddenCaptures.push(...addedHiddenCaptures);

  if (hasBackrefs) {
    // Second pass to adjust backrefs
    expression = replaceUnescaped(
      expression,
      String.raw`\\(?:(?<bNum>[1-9]\d*)|k<\$\$b(?<bNumSub>\d+)s(?<subNum>\d+)r(?<refNum>\d+)c(?<refCaps>\d+)>)`,
      ({0: m, groups: {bNum, bNumSub, subNum, refNum, refCaps}}) => {
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
        if (backrefNumInSubroutine < refGroupNum || backrefNumInSubroutine > (refGroupNum + numCapturesInRef)) {
          return `\\${captureNumMap[backrefNumInSubroutine]}`;
        }
        return `\\${subroutineGroupNum - refGroupNum + backrefNumInSubroutine}`;
      },
      Context.DEFAULT
    );
  }

  return {
    pattern: expression,
    hiddenCaptures,
  };
}

// `(?:)` allowed because it can be added by flag x's preprocessing of whitespace and comments
const defineGroupToken = new RegExp(String.raw`${namedCapturingDelim}|\(\?:\)|(?<invalid>\\?.)`, 'gsu');

/**
Remove valid subroutine definition groups: `(?(DEFINE)…)`.
@param {string} expression
@param {NamedCapturingGroupsMap} namedGroups
IMPORTANT: Avoid using the `contents` property of `namedGroups` objects, because at this point
subroutine substitution has been performed on the corresponding substrings in `expression`
@returns {string}
*/
function processDefinitionGroup(expression, namedGroups) {
  const defineMatch = execUnescaped(expression, String.raw`\(\?\(DEFINE\)`, 0, Context.DEFAULT);
  if (!defineMatch) {
    return expression;
  }
  const defineGroup = getGroup(expression, defineMatch);
  if (defineGroup.afterPos < expression.length) {
    // Supporting DEFINE at positions other than the end would complicate backref handling.
    // NOTE: Flag x's preprocessing permits trailing whitespace and comments
    throw new Error('DEFINE group allowed only at the end of a regex');
  } else if (defineGroup.afterPos > expression.length) {
    throw new Error('DEFINE group is unclosed');
  }
  let match;
  defineGroupToken.lastIndex = 0;
  while (match = defineGroupToken.exec(defineGroup.contents)) {
    const {captureName, invalid} = match.groups;
    if (captureName) {
      const group = getGroup(defineGroup.contents, match);
      let duplicateName;
      if (!namedGroups.get(captureName).isUnique) {
        duplicateName = captureName;
      } else {
        const nestedNamedGroups = getNamedCapturingGroups(group.contents, {includeContents: false});
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
      // Since a DEFINE group is stripped from its expression, we can't easily determine whether
      // unreferenced top-level syntax within it is valid. Such syntax serves no purpose, so it's
      // easiest to not allow it
      throw new Error(`DEFINE group includes unsupported syntax at top level`);
    }
  }
  return expression.slice(0, defineMatch.index);
}

/**
Counts unescaped open parens outside of character classes, regardless of group type
@param {string} expression
@returns {number}
*/
function countOpenParens(expression) {
  let num = 0;
  forEachUnescaped(expression, '\\(', () => num++, Context.DEFAULT);
  return num;
}

/**
@param {string} expression
@param {string} groupName
@returns {number}
*/
function getCaptureNum(expression, groupName) {
  let num = 0;
  let pos = 0;
  let match;
  while (match = execUnescaped(expression, capturingDelim, pos, Context.DEFAULT)) {
    const {0: m, index, groups: {captureName}} = match;
    num++;
    if (captureName === groupName) {
      break;
    }
    pos = index + m.length;
  }
  return num;
}

/**
@param {string} expression
@param {RegExpExecArray} delimMatch
@returns {{contents: string; afterPos: number}}
*/
function getGroup(expression, delimMatch) {
  const contentsStart = delimMatch.index + delimMatch[0].length;
  const contents = getGroupContents(expression, contentsStart);
  const afterPos = contentsStart + contents.length + 1;
  return {
    contents,
    afterPos,
  };
}

/**
@param {string} expression
@param {{includeContents: boolean}} options
@returns {NamedCapturingGroupsMap}
*/
function getNamedCapturingGroups(expression, {includeContents}) {
  const namedGroups = new Map();
  forEachUnescaped(
    expression,
    namedCapturingDelim,
    ({0: m, index, groups: {captureName}}) => {
      // If there are duplicate capture names, subroutines refer to the first instance of the given
      // group (matching the behavior of PCRE and Perl)
      if (namedGroups.has(captureName)) {
        namedGroups.get(captureName).isUnique = false;
      } else {
        const group = {isUnique: true};
        if (includeContents) {
          const contents = getGroupContents(expression, index + m.length);
          Object.assign(group, {
            contents,
            groupNum: getCaptureNum(expression, captureName),
            numCaptures: countCaptures(contents),
          });
        }
        namedGroups.set(captureName, group);
      }
    },
    Context.DEFAULT
  );
  return namedGroups;
}

/**
@param {Array<any>} arr
@returns {any}
*/
function lastOf(arr) {
  // Remove when support for ES2022 array method `at` (Node.js 16.6) is no longer an issue:
  // <https://caniuse.com/mdn-javascript_builtins_array_at>
  return arr[arr.length - 1];
}

/**
@param {Array<number>} hiddenCaptures
@param {Array<number>} addedHiddenCaptures
@param {number} addedCaptureNum
*/
function updateHiddenCaptureTracking(hiddenCaptures, addedHiddenCaptures, addedCaptureNum) {
  addedHiddenCaptures.push(addedCaptureNum);
  incrementIfAtLeast(hiddenCaptures, addedCaptureNum);
}

export {
  subroutines,
};
