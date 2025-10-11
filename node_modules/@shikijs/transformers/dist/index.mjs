import { warnDeprecated } from '@shikijs/core';

const matchers = [
  [/^(<!--)(.+)(-->)$/, false],
  [/^(\/\*)(.+)(\*\/)$/, false],
  [/^(\/\/|["'#]|;{1,2}|%{1,2}|--)(.*)$/, true],
  /**
   * for multi-line comments like this
   */
  [/^(\*)(.+)$/, true]
];
function parseComments(lines, jsx, matchAlgorithm) {
  const out = [];
  for (const line of lines) {
    if (matchAlgorithm === "v3") {
      const splittedElements = line.children.flatMap((element, idx) => {
        if (element.type !== "element")
          return element;
        const token = element.children[0];
        if (token.type !== "text")
          return element;
        const isLast = idx === line.children.length - 1;
        const isComment = matchToken(token.value, isLast);
        if (!isComment)
          return element;
        const rawSplits = token.value.split(/(\s+\/\/)/);
        if (rawSplits.length <= 1)
          return element;
        let splits = [rawSplits[0]];
        for (let i = 1; i < rawSplits.length; i += 2) {
          splits.push(rawSplits[i] + (rawSplits[i + 1] || ""));
        }
        splits = splits.filter(Boolean);
        if (splits.length <= 1)
          return element;
        return splits.map((split) => {
          return {
            ...element,
            children: [
              {
                type: "text",
                value: split
              }
            ]
          };
        });
      });
      if (splittedElements.length !== line.children.length)
        line.children = splittedElements;
    }
    const elements = line.children;
    let start = elements.length - 1;
    if (matchAlgorithm === "v1")
      start = 0;
    else if (jsx)
      start = elements.length - 2;
    for (let i = Math.max(start, 0); i < elements.length; i++) {
      const token = elements[i];
      if (token.type !== "element")
        continue;
      const head = token.children.at(0);
      if (head?.type !== "text")
        continue;
      const isLast = i === elements.length - 1;
      const match = matchToken(head.value, isLast);
      if (!match)
        continue;
      if (jsx && !isLast && i !== 0) {
        const isJsxStyle = isValue(elements[i - 1], "{") && isValue(elements[i + 1], "}");
        out.push({
          info: match,
          line,
          token,
          isLineCommentOnly: elements.length === 3 && token.children.length === 1,
          isJsxStyle
        });
      } else {
        out.push({
          info: match,
          line,
          token,
          isLineCommentOnly: elements.length === 1 && token.children.length === 1,
          isJsxStyle: false
        });
      }
    }
  }
  return out;
}
function isValue(element, value) {
  if (element.type !== "element")
    return false;
  const text = element.children[0];
  if (text.type !== "text")
    return false;
  return text.value.trim() === value;
}
function matchToken(text, isLast) {
  let trimmed = text.trimStart();
  const spaceFront = text.length - trimmed.length;
  trimmed = trimmed.trimEnd();
  const spaceEnd = text.length - trimmed.length - spaceFront;
  for (const [matcher, endOfLine] of matchers) {
    if (endOfLine && !isLast)
      continue;
    const result = matcher.exec(trimmed);
    if (!result)
      continue;
    return [
      " ".repeat(spaceFront) + result[1],
      result[2],
      result[3] ? result[3] + " ".repeat(spaceEnd) : void 0
    ];
  }
}
function v1ClearEndCommentPrefix(text) {
  const match = text.match(/(?:\/\/|["'#]|;{1,2}|%{1,2}|--)(\s*)$/);
  if (match && match[1].trim().length === 0) {
    return text.slice(0, match.index);
  }
  return text;
}

function createCommentNotationTransformer(name, regex, onMatch, matchAlgorithm) {
  if (matchAlgorithm == null) {
    matchAlgorithm = "v1";
    warnDeprecated('The default `matchAlgorithm: "v1"` is deprecated and will be removed in the future. Please explicitly set `matchAlgorithm: "v3"` in the transformer options.', 3);
  }
  return {
    name,
    code(code) {
      const lines = code.children.filter((i) => i.type === "element");
      const linesToRemove = [];
      code.data ??= {};
      const data = code.data;
      data._shiki_notation ??= parseComments(lines, ["jsx", "tsx"].includes(this.options.lang), matchAlgorithm);
      const parsed = data._shiki_notation;
      for (const comment of parsed) {
        if (comment.info[1].length === 0)
          continue;
        let lineIdx = lines.indexOf(comment.line);
        if (comment.isLineCommentOnly && matchAlgorithm !== "v1")
          lineIdx++;
        let replaced = false;
        comment.info[1] = comment.info[1].replace(regex, (...match) => {
          if (onMatch.call(this, match, comment.line, comment.token, lines, lineIdx)) {
            replaced = true;
            return "";
          }
          return match[0];
        });
        if (!replaced)
          continue;
        if (matchAlgorithm === "v1")
          comment.info[1] = v1ClearEndCommentPrefix(comment.info[1]);
        const isEmpty = comment.info[1].trim().length === 0;
        if (isEmpty)
          comment.info[1] = "";
        if (isEmpty && comment.isLineCommentOnly) {
          linesToRemove.push(comment.line);
        } else if (isEmpty && comment.isJsxStyle) {
          comment.line.children.splice(comment.line.children.indexOf(comment.token) - 1, 3);
        } else if (isEmpty) {
          comment.line.children.splice(comment.line.children.indexOf(comment.token), 1);
        } else {
          const head = comment.token.children[0];
          if (head.type === "text") {
            head.value = comment.info.join("");
          }
        }
      }
      for (const line of linesToRemove) {
        const index = code.children.indexOf(line);
        const nextLine = code.children[index + 1];
        let removeLength = 1;
        if (nextLine?.type === "text" && nextLine?.value === "\n")
          removeLength = 2;
        code.children.splice(index, removeLength);
      }
    }
  };
}

function transformerCompactLineOptions(lineOptions = []) {
  return {
    name: "@shikijs/transformers:compact-line-options",
    line(node, line) {
      const lineOption = lineOptions.find((o) => o.line === line);
      if (lineOption?.classes)
        this.addClassToHast(node, lineOption.classes);
      return node;
    }
  };
}

function parseMetaHighlightString(meta) {
  if (!meta)
    return null;
  const match = meta.match(/\{([\d,-]+)\}/);
  if (!match)
    return null;
  const lines = match[1].split(",").flatMap((v) => {
    const num = v.split("-").map((v2) => Number.parseInt(v2, 10));
    if (num.length === 1)
      return [num[0]];
    return Array.from({ length: num[1] - num[0] + 1 }, (_, i) => i + num[0]);
  });
  return lines;
}
const symbol = Symbol("highlighted-lines");
function transformerMetaHighlight(options = {}) {
  const {
    className = "highlighted"
  } = options;
  return {
    name: "@shikijs/transformers:meta-highlight",
    line(node, line) {
      if (!this.options.meta?.__raw) {
        return;
      }
      const meta = this.meta;
      meta[symbol] ??= parseMetaHighlightString(this.options.meta.__raw);
      const lines = meta[symbol] ?? [];
      if (lines.includes(line))
        this.addClassToHast(node, className);
      return node;
    }
  };
}

function parseMetaHighlightWords(meta) {
  if (!meta)
    return [];
  const match = Array.from(meta.matchAll(/\/((?:\\.|[^/])+)\//g));
  return match.map((v) => v[1].replace(/\\(.)/g, "$1"));
}
function transformerMetaWordHighlight(options = {}) {
  const {
    className = "highlighted-word"
  } = options;
  return {
    name: "@shikijs/transformers:meta-word-highlight",
    preprocess(code, options2) {
      if (!this.options.meta?.__raw)
        return;
      const words = parseMetaHighlightWords(this.options.meta.__raw);
      options2.decorations ||= [];
      for (const word of words) {
        const indexes = findAllSubstringIndexes(code, word);
        for (const index of indexes) {
          options2.decorations.push({
            start: index,
            end: index + word.length,
            properties: {
              class: className
            }
          });
        }
      }
    }
  };
}
function findAllSubstringIndexes(str, substr) {
  const indexes = [];
  let cursor = 0;
  while (true) {
    const index = str.indexOf(substr, cursor);
    if (index === -1 || index >= str.length)
      break;
    if (index < cursor)
      break;
    indexes.push(index);
    cursor = index + substr.length;
  }
  return indexes;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function transformerNotationMap(options = {}, name = "@shikijs/transformers:notation-map") {
  const {
    classMap = {},
    classActivePre = void 0
  } = options;
  return createCommentNotationTransformer(
    name,
    new RegExp(`\\s*\\[!code (${Object.keys(classMap).map(escapeRegExp).join("|")})(:\\d+)?\\]`),
    function([_, match, range = ":1"], _line, _comment, lines, index) {
      const lineNum = Number.parseInt(range.slice(1), 10);
      for (let i = index; i < Math.min(index + lineNum, lines.length); i++) {
        this.addClassToHast(lines[i], classMap[match]);
      }
      if (classActivePre)
        this.addClassToHast(this.pre, classActivePre);
      return true;
    },
    options.matchAlgorithm
  );
}

function transformerNotationDiff(options = {}) {
  const {
    classLineAdd = "diff add",
    classLineRemove = "diff remove",
    classActivePre = "has-diff"
  } = options;
  return transformerNotationMap(
    {
      classMap: {
        "++": classLineAdd,
        "--": classLineRemove
      },
      classActivePre,
      matchAlgorithm: options.matchAlgorithm
    },
    "@shikijs/transformers:notation-diff"
  );
}

function transformerNotationErrorLevel(options = {}) {
  const {
    classMap = {
      error: ["highlighted", "error"],
      warning: ["highlighted", "warning"]
    },
    classActivePre = "has-highlighted"
  } = options;
  return transformerNotationMap(
    {
      classMap,
      classActivePre,
      matchAlgorithm: options.matchAlgorithm
    },
    "@shikijs/transformers:notation-error-level"
  );
}

function transformerNotationFocus(options = {}) {
  const {
    classActiveLine = "focused",
    classActivePre = "has-focused"
  } = options;
  return transformerNotationMap(
    {
      classMap: {
        focus: classActiveLine
      },
      classActivePre,
      matchAlgorithm: options.matchAlgorithm
    },
    "@shikijs/transformers:notation-focus"
  );
}

function transformerNotationHighlight(options = {}) {
  const {
    classActiveLine = "highlighted",
    classActivePre = "has-highlighted"
  } = options;
  return transformerNotationMap(
    {
      classMap: {
        highlight: classActiveLine,
        hl: classActiveLine
      },
      classActivePre,
      matchAlgorithm: options.matchAlgorithm
    },
    "@shikijs/transformers:notation-highlight"
  );
}

function highlightWordInLine(line, ignoredElement, word, className) {
  const content = getTextContent(line);
  let index = content.indexOf(word);
  while (index !== -1) {
    highlightRange.call(this, line.children, ignoredElement, index, word.length, className);
    index = content.indexOf(word, index + 1);
  }
}
function getTextContent(element) {
  if (element.type === "text")
    return element.value;
  if (element.type === "element" && element.tagName === "span")
    return element.children.map(getTextContent).join("");
  return "";
}
function highlightRange(elements, ignoredElement, index, len, className) {
  let currentIdx = 0;
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element.type !== "element" || element.tagName !== "span" || element === ignoredElement)
      continue;
    const textNode = element.children[0];
    if (textNode.type !== "text")
      continue;
    if (hasOverlap([currentIdx, currentIdx + textNode.value.length - 1], [index, index + len])) {
      const start = Math.max(0, index - currentIdx);
      const length = len - Math.max(0, currentIdx - index);
      if (length === 0)
        continue;
      const separated = separateToken(element, textNode, start, length);
      this.addClassToHast(separated[1], className);
      const output = separated.filter(Boolean);
      elements.splice(i, 1, ...output);
      i += output.length - 1;
    }
    currentIdx += textNode.value.length;
  }
}
function hasOverlap(range1, range2) {
  return range1[0] <= range2[1] && range1[1] >= range2[0];
}
function separateToken(span, textNode, index, len) {
  const text = textNode.value;
  const createNode = (value) => inheritElement(span, {
    children: [
      {
        type: "text",
        value
      }
    ]
  });
  return [
    index > 0 ? createNode(text.slice(0, index)) : void 0,
    createNode(text.slice(index, index + len)),
    index + len < text.length ? createNode(text.slice(index + len)) : void 0
  ];
}
function inheritElement(original, overrides) {
  return {
    ...original,
    properties: {
      ...original.properties
    },
    ...overrides
  };
}

function transformerNotationWordHighlight(options = {}) {
  const {
    classActiveWord = "highlighted-word",
    classActivePre = void 0
  } = options;
  return createCommentNotationTransformer(
    "@shikijs/transformers:notation-highlight-word",
    /\s*\[!code word:((?:\\.|[^:\]])+)(:\d+)?\]/,
    function([_, word, range], _line, comment, lines, index) {
      const lineNum = range ? Number.parseInt(range.slice(1), 10) : lines.length;
      word = word.replace(/\\(.)/g, "$1");
      for (let i = index; i < Math.min(index + lineNum, lines.length); i++) {
        highlightWordInLine.call(this, lines[i], comment, word, classActiveWord);
      }
      if (classActivePre)
        this.addClassToHast(this.pre, classActivePre);
      return true;
    },
    options.matchAlgorithm
  );
}

function transformerRemoveLineBreak() {
  return {
    name: "@shikijs/transformers:remove-line-break",
    code(code) {
      code.children = code.children.filter((line) => !(line.type === "text" && line.value === "\n"));
    }
  };
}

function transformerRemoveNotationEscape() {
  return {
    name: "@shikijs/transformers:remove-notation-escape",
    postprocess(code) {
      return code.replace(/\[\\!code/g, "[!code");
    }
  };
}

function isTab(part) {
  return part === "	";
}
function isSpace(part) {
  return part === " " || part === "	";
}
function separateContinuousSpaces(inputs) {
  const result = [];
  let current = "";
  function bump() {
    if (current.length)
      result.push(current);
    current = "";
  }
  inputs.forEach((part, idx) => {
    if (isTab(part)) {
      bump();
      result.push(part);
    } else if (isSpace(part) && (isSpace(inputs[idx - 1]) || isSpace(inputs[idx + 1]))) {
      bump();
      result.push(part);
    } else {
      current += part;
    }
  });
  bump();
  return result;
}
function splitSpaces(parts, type, renderContinuousSpaces = true) {
  if (type === "all")
    return parts;
  let leftCount = 0;
  let rightCount = 0;
  if (type === "boundary") {
    for (let i = 0; i < parts.length; i++) {
      if (isSpace(parts[i]))
        leftCount++;
      else
        break;
    }
  }
  if (type === "boundary" || type === "trailing") {
    for (let i = parts.length - 1; i >= 0; i--) {
      if (isSpace(parts[i]))
        rightCount++;
      else
        break;
    }
  }
  const middle = parts.slice(leftCount, parts.length - rightCount);
  return [
    ...parts.slice(0, leftCount),
    ...renderContinuousSpaces ? separateContinuousSpaces(middle) : [middle.join("")],
    ...parts.slice(parts.length - rightCount)
  ];
}

function transformerRenderWhitespace(options = {}) {
  const classMap = {
    " ": options.classSpace ?? "space",
    "	": options.classTab ?? "tab"
  };
  const position = options.position ?? "all";
  const keys = Object.keys(classMap);
  return {
    name: "@shikijs/transformers:render-whitespace",
    // We use `root` hook here to ensure it runs after all other transformers
    root(root) {
      const pre = root.children[0];
      const code = pre.children[0];
      code.children.forEach(
        (line) => {
          if (line.type !== "element")
            return;
          const elements = line.children.filter((token) => token.type === "element");
          const last = elements.length - 1;
          line.children = line.children.flatMap((token) => {
            if (token.type !== "element")
              return token;
            const index = elements.indexOf(token);
            if (position === "boundary" && index !== 0 && index !== last)
              return token;
            if (position === "trailing" && index !== last)
              return token;
            const node = token.children[0];
            if (node.type !== "text" || !node.value)
              return token;
            const parts = splitSpaces(
              node.value.split(/([ \t])/).filter((i) => i.length),
              position === "boundary" && index === last && last !== 0 ? "trailing" : position,
              position !== "trailing"
            );
            if (parts.length <= 1)
              return token;
            return parts.map((part) => {
              const clone = {
                ...token,
                properties: { ...token.properties }
              };
              clone.children = [{ type: "text", value: part }];
              if (keys.includes(part)) {
                this.addClassToHast(clone, classMap[part]);
                delete clone.properties.style;
              }
              return clone;
            });
          });
        }
      );
    }
  };
}

function transformerStyleToClass(options = {}) {
  const {
    classPrefix = "__shiki_",
    classSuffix = "",
    classReplacer = (className) => className
  } = options;
  const classToStyle = /* @__PURE__ */ new Map();
  function stringifyStyle(style) {
    return Object.entries(style).map(([key, value]) => `${key}:${value}`).join(";");
  }
  function registerStyle(style) {
    const str = typeof style === "string" ? style : stringifyStyle(style);
    let className = classPrefix + cyrb53(str) + classSuffix;
    className = classReplacer(className);
    if (!classToStyle.has(className)) {
      classToStyle.set(
        className,
        typeof style === "string" ? style : { ...style }
      );
    }
    return className;
  }
  return {
    name: "@shikijs/transformers:style-to-class",
    pre(t) {
      if (!t.properties.style)
        return;
      const className = registerStyle(t.properties.style);
      delete t.properties.style;
      this.addClassToHast(t, className);
    },
    tokens(lines) {
      for (const line of lines) {
        for (const token of line) {
          if (!token.htmlStyle)
            continue;
          const className = registerStyle(token.htmlStyle);
          token.htmlStyle = {};
          token.htmlAttrs ||= {};
          if (!token.htmlAttrs.class)
            token.htmlAttrs.class = className;
          else
            token.htmlAttrs.class += ` ${className}`;
        }
      }
    },
    getClassRegistry() {
      return classToStyle;
    },
    getCSS() {
      let css = "";
      for (const [className, style] of classToStyle.entries()) {
        css += `.${className}{${typeof style === "string" ? style : stringifyStyle(style)}}`;
      }
      return css;
    },
    clearRegistry() {
      classToStyle.clear();
    }
  };
}
function cyrb53(str, seed = 0) {
  let h1 = 3735928559 ^ seed;
  let h2 = 1103547991 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507);
  h1 ^= Math.imul(h2 ^ h2 >>> 13, 3266489909);
  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507);
  h2 ^= Math.imul(h1 ^ h1 >>> 13, 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36).slice(0, 6);
}

export { createCommentNotationTransformer, findAllSubstringIndexes, parseMetaHighlightString, parseMetaHighlightWords, transformerCompactLineOptions, transformerMetaHighlight, transformerMetaWordHighlight, transformerNotationDiff, transformerNotationErrorLevel, transformerNotationFocus, transformerNotationHighlight, transformerNotationMap, transformerNotationWordHighlight, transformerRemoveLineBreak, transformerRemoveNotationEscape, transformerRenderWhitespace, transformerStyleToClass };
