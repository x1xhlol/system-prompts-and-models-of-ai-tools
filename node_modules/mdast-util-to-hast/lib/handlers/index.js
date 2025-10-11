import {blockquote} from './blockquote.js'
import {hardBreak} from './break.js'
import {code} from './code.js'
import {strikethrough} from './delete.js'
import {emphasis} from './emphasis.js'
import {footnoteReference} from './footnote-reference.js'
import {heading} from './heading.js'
import {html} from './html.js'
import {imageReference} from './image-reference.js'
import {image} from './image.js'
import {inlineCode} from './inline-code.js'
import {linkReference} from './link-reference.js'
import {link} from './link.js'
import {listItem} from './list-item.js'
import {list} from './list.js'
import {paragraph} from './paragraph.js'
import {root} from './root.js'
import {strong} from './strong.js'
import {table} from './table.js'
import {tableRow} from './table-row.js'
import {tableCell} from './table-cell.js'
import {text} from './text.js'
import {thematicBreak} from './thematic-break.js'

/**
 * Default handlers for nodes.
 *
 * @satisfies {import('../state.js').Handlers}
 */
export const handlers = {
  blockquote,
  break: hardBreak,
  code,
  delete: strikethrough,
  emphasis,
  footnoteReference,
  heading,
  html,
  imageReference,
  image,
  inlineCode,
  linkReference,
  link,
  listItem,
  list,
  paragraph,
  // @ts-expect-error: root is different, but hard to type.
  root,
  strong,
  table,
  tableCell,
  tableRow,
  text,
  thematicBreak,
  toml: ignore,
  yaml: ignore,
  definition: ignore,
  footnoteDefinition: ignore
}

// Return nothing for nodes that are ignored.
function ignore() {
  return undefined
}
