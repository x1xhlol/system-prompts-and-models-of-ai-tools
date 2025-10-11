import { ShikiTransformerContext, ShikiTransformer } from '@shikijs/core';
import { Element } from 'hast';
import { ShikiTransformer as ShikiTransformer$1 } from '@shikijs/types';

type MatchAlgorithm = 'v1' | 'v3';
interface MatchAlgorithmOptions {
    /**
     * Match algorithm to use
     *
     * @see https://shiki.style/packages/transformers#matching-algorithm
     * @default 'v1'
     */
    matchAlgorithm?: MatchAlgorithm;
}
declare function createCommentNotationTransformer(name: string, regex: RegExp, onMatch: (this: ShikiTransformerContext, match: string[], line: Element, commentNode: Element, lines: Element[], index: number) => boolean, matchAlgorithm: MatchAlgorithm | undefined): ShikiTransformer;

interface TransformerCompactLineOption {
    /**
     * 1-based line number.
     */
    line: number;
    classes?: string[];
}
/**
 * Transformer for `shiki`'s legacy `lineOptions`
 */
declare function transformerCompactLineOptions(lineOptions?: TransformerCompactLineOption[]): ShikiTransformer$1;

declare function parseMetaHighlightString(meta: string): number[] | null;
interface TransformerMetaHighlightOptions {
    /**
     * Class for highlighted lines
     *
     * @default 'highlighted'
     */
    className?: string;
}
/**
 * Allow using `{1,3-5}` in the code snippet meta to mark highlighted lines.
 */
declare function transformerMetaHighlight(options?: TransformerMetaHighlightOptions): ShikiTransformer$1;

declare function parseMetaHighlightWords(meta: string): string[];
interface TransformerMetaWordHighlightOptions {
    /**
     * Class for highlighted words
     *
     * @default 'highlighted-word'
     */
    className?: string;
}
/**
 * Allow using `/word/` in the code snippet meta to mark highlighted words.
 */
declare function transformerMetaWordHighlight(options?: TransformerMetaWordHighlightOptions): ShikiTransformer$1;
declare function findAllSubstringIndexes(str: string, substr: string): number[];

interface TransformerNotationDiffOptions extends MatchAlgorithmOptions {
    /**
     * Class for added lines
     */
    classLineAdd?: string;
    /**
     * Class for removed lines
     */
    classLineRemove?: string;
    /**
     * Class added to the <pre> element when the current code has diff
     */
    classActivePre?: string;
}
/**
 * Use `[!code ++]` and `[!code --]` to mark added and removed lines.
 */
declare function transformerNotationDiff(options?: TransformerNotationDiffOptions): ShikiTransformer$1;

interface TransformerNotationErrorLevelOptions extends MatchAlgorithmOptions {
    classMap?: Record<string, string | string[]>;
    /**
     * Class added to the <pre> element when the current code has diff
     */
    classActivePre?: string;
}
/**
 * Allow using `[!code error]` `[!code warning]` notation in code to mark highlighted lines.
 */
declare function transformerNotationErrorLevel(options?: TransformerNotationErrorLevelOptions): ShikiTransformer$1;

interface TransformerNotationFocusOptions extends MatchAlgorithmOptions {
    /**
     * Class for focused lines
     */
    classActiveLine?: string;
    /**
     * Class added to the root element when the code has focused lines
     */
    classActivePre?: string;
}
/**
 * Allow using `[!code focus]` notation in code to mark focused lines.
 */
declare function transformerNotationFocus(options?: TransformerNotationFocusOptions): ShikiTransformer$1;

interface TransformerNotationHighlightOptions extends MatchAlgorithmOptions {
    /**
     * Class for highlighted lines
     */
    classActiveLine?: string;
    /**
     * Class added to the root element when the code has highlighted lines
     */
    classActivePre?: string;
}
/**
 * Allow using `[!code highlight]` notation in code to mark highlighted lines.
 */
declare function transformerNotationHighlight(options?: TransformerNotationHighlightOptions): ShikiTransformer$1;

interface TransformerNotationWordHighlightOptions extends MatchAlgorithmOptions {
    /**
     * Class for highlighted words
     */
    classActiveWord?: string;
    /**
     * Class added to the root element when the code has highlighted words
     */
    classActivePre?: string;
}
declare function transformerNotationWordHighlight(options?: TransformerNotationWordHighlightOptions): ShikiTransformer$1;

interface TransformerNotationMapOptions extends MatchAlgorithmOptions {
    classMap?: Record<string, string | string[]>;
    /**
     * Class added to the <pre> element when the current code has diff
     */
    classActivePre?: string;
}
declare function transformerNotationMap(options?: TransformerNotationMapOptions, name?: string): ShikiTransformer$1;

/**
 * Remove line breaks between lines.
 * Useful when you override `display: block` to `.line` in CSS.
 */
declare function transformerRemoveLineBreak(): ShikiTransformer$1;

/**
 * Remove notation escapes.
 * Useful when you want to write `// [!code` in markdown.
 * If you process `// [\!code ...]` expression, you can get `// [!code ...]` in the output.
 */
declare function transformerRemoveNotationEscape(): ShikiTransformer$1;

interface TransformerRenderWhitespaceOptions {
    /**
     * Class for tab
     *
     * @default 'tab'
     */
    classTab?: string;
    /**
     * Class for space
     *
     * @default 'space'
     */
    classSpace?: string;
    /**
     * Position of rendered whitespace
     * @default all position
     */
    position?: 'all' | 'boundary' | 'trailing';
}
/**
 * Render whitespaces as separate tokens.
 * Apply with CSS, it can be used to render tabs and spaces visually.
 */
declare function transformerRenderWhitespace(options?: TransformerRenderWhitespaceOptions): ShikiTransformer$1;

interface TransformerStyleToClassOptions {
    /**
     * Prefix for class names.
     * @default '__shiki_'
     */
    classPrefix?: string;
    /**
     * Suffix for class names.
     * @default ''
     */
    classSuffix?: string;
    /**
     * Callback to replace class names.
     * @default (className) => className
     */
    classReplacer?: (className: string) => string;
}
interface ShikiTransformerStyleToClass extends ShikiTransformer$1 {
    getClassRegistry: () => Map<string, Record<string, string> | string>;
    getCSS: () => string;
    clearRegistry: () => void;
}
/**
 * Remove line breaks between lines.
 * Useful when you override `display: block` to `.line` in CSS.
 */
declare function transformerStyleToClass(options?: TransformerStyleToClassOptions): ShikiTransformerStyleToClass;

export { type ShikiTransformerStyleToClass, type TransformerCompactLineOption, type TransformerMetaHighlightOptions, type TransformerMetaWordHighlightOptions, type TransformerNotationDiffOptions, type TransformerNotationErrorLevelOptions, type TransformerNotationFocusOptions, type TransformerNotationHighlightOptions, type TransformerNotationMapOptions, type TransformerNotationWordHighlightOptions, type TransformerRenderWhitespaceOptions, type TransformerStyleToClassOptions, createCommentNotationTransformer, findAllSubstringIndexes, parseMetaHighlightString, parseMetaHighlightWords, transformerCompactLineOptions, transformerMetaHighlight, transformerMetaWordHighlight, transformerNotationDiff, transformerNotationErrorLevel, transformerNotationFocus, transformerNotationHighlight, transformerNotationMap, transformerNotationWordHighlight, transformerRemoveLineBreak, transformerRemoveNotationEscape, transformerRenderWhitespace, transformerStyleToClass };
