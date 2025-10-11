/**
 * This module is compiled away!
 *
 * Parsing markdown comes with a couple of constants, such as minimum or maximum
 * sizes of certain sequences.
 * Additionally, there are a couple symbols used inside micromark.
 * These are all defined here, but compiled away by scripts.
 */
export const constants = /** @type {const} */ ({
  attentionSideAfter: 2, // Symbol to mark an attention sequence as after content: `a*`
  attentionSideBefore: 1, // Symbol to mark an attention sequence as before content: `*a`
  atxHeadingOpeningFenceSizeMax: 6, // 6 number signs is fine, 7 isn’t.
  autolinkDomainSizeMax: 63, // 63 characters is fine, 64 is too many.
  autolinkSchemeSizeMax: 32, // 32 characters is fine, 33 is too many.
  cdataOpeningString: 'CDATA[', // And preceded by `<![`.
  characterGroupPunctuation: 2, // Symbol used to indicate a character is punctuation
  characterGroupWhitespace: 1, // Symbol used to indicate a character is whitespace
  characterReferenceDecimalSizeMax: 7, // `&#9999999;`.
  characterReferenceHexadecimalSizeMax: 6, // `&#xff9999;`.
  characterReferenceNamedSizeMax: 31, // `&CounterClockwiseContourIntegral;`.
  codeFencedSequenceSizeMin: 3, // At least 3 ticks or tildes are needed.
  contentTypeContent: 'content',
  contentTypeDocument: 'document',
  contentTypeFlow: 'flow',
  contentTypeString: 'string',
  contentTypeText: 'text',
  hardBreakPrefixSizeMin: 2, // At least 2 trailing spaces are needed.
  htmlBasic: 6, // Symbol for `<div`
  htmlCdata: 5, // Symbol for `<![CDATA[]]>`
  htmlComment: 2, // Symbol for `<!---->`
  htmlComplete: 7, // Symbol for `<x>`
  htmlDeclaration: 4, // Symbol for `<!doctype>`
  htmlInstruction: 3, // Symbol for `<?php?>`
  htmlRawSizeMax: 8, // Length of `textarea`.
  htmlRaw: 1, // Symbol for `<script>`
  linkResourceDestinationBalanceMax: 32, // See: <https://spec.commonmark.org/0.30/#link-destination>, <https://github.com/remarkjs/react-markdown/issues/658#issuecomment-984345577>
  linkReferenceSizeMax: 999, // See: <https://spec.commonmark.org/0.30/#link-label>
  listItemValueSizeMax: 10, // See: <https://spec.commonmark.org/0.30/#ordered-list-marker>
  numericBaseDecimal: 10,
  numericBaseHexadecimal: 0x10,
  tabSize: 4, // Tabs have a hard-coded size of 4, per CommonMark.
  thematicBreakMarkerCountMin: 3, // At least 3 asterisks, dashes, or underscores are needed.
  v8MaxSafeChunkSize: 10_000 // V8 (and potentially others) have problems injecting giant arrays into other arrays, hence we operate in chunks.
})
