import html from './html.mjs'
import angular_expression from './angular-expression.mjs'
import angular_let_declaration from './angular-let-declaration.mjs'
import angular_template from './angular-template.mjs'
import angular_template_blocks from './angular-template-blocks.mjs'

const lang = Object.freeze(JSON.parse("{\"displayName\":\"Angular HTML\",\"injections\":{\"R:text.html - (comment.block, text.html meta.embedded, meta.tag.*.*.html, meta.tag.*.*.*.html, meta.tag.*.*.*.*.html)\":{\"comment\":\"Uses R: to ensure this matches after any other injections.\",\"patterns\":[{\"match\":\"<\",\"name\":\"invalid.illegal.bad-angle-bracket.html\"}]}},\"name\":\"angular-html\",\"patterns\":[{\"include\":\"text.html.basic#core-minus-invalid\"},{\"begin\":\"(</?)(\\\\w[^\\\\s>]*)(?<!/)\",\"beginCaptures\":{\"1\":{\"name\":\"punctuation.definition.tag.begin.html\"},\"2\":{\"name\":\"entity.name.tag.html\"}},\"end\":\"((?: ?/)?>)\",\"endCaptures\":{\"1\":{\"name\":\"punctuation.definition.tag.end.html\"}},\"name\":\"meta.tag.other.unrecognized.html.derivative\",\"patterns\":[{\"include\":\"text.html.basic#attribute\"}]}],\"scopeName\":\"text.html.derivative.ng\",\"embeddedLangs\":[\"html\",\"angular-expression\",\"angular-let-declaration\",\"angular-template\",\"angular-template-blocks\"]}"))

export default [
...html,
...angular_expression,
...angular_let_declaration,
...angular_template,
...angular_template_blocks,
lang
]
