import angular_expression from './angular-expression.mjs'
import angular_template from './angular-template.mjs'

const lang = Object.freeze(JSON.parse("{\"injectTo\":[\"text.html.derivative\",\"text.html.derivative.ng\",\"source.ts.ng\"],\"injectionSelector\":\"L:text.html -comment -expression.ng -meta.tag -source.css -source.js\",\"name\":\"angular-template-blocks\",\"patterns\":[{\"include\":\"#block\"}],\"repository\":{\"block\":{\"begin\":\"(@)(if|else if|else|defer|placeholder|loading|error|switch|case|default|for|empty)(?:\\\\s*)\",\"beginCaptures\":{\"1\":{\"patterns\":[{\"include\":\"#transition\"}]},\"2\":{\"name\":\"keyword.control.block.kind.ng\"}},\"end\":\"(?<=\\\\})\",\"name\":\"control.block.ng\",\"patterns\":[{\"include\":\"#blockExpression\"},{\"include\":\"#blockBody\"}]},\"blockBody\":{\"begin\":\"\\\\{\",\"beginCaptures\":{\"0\":{\"name\":\"punctuation.definition.block.ts\"}},\"contentName\":\"control.block.body.ng\",\"end\":\"\\\\}\",\"endCaptures\":{\"0\":{\"name\":\"punctuation.definition.block.ts\"}},\"patterns\":[{\"include\":\"text.html.derivative.ng\"},{\"include\":\"template.ng\"}]},\"blockExpression\":{\"begin\":\"\\\\(\",\"beginCaptures\":{\"0\":{\"name\":\"meta.brace.round.ts\"}},\"contentName\":\"control.block.expression.ng\",\"end\":\"\\\\)\",\"endCaptures\":{\"0\":{\"name\":\"meta.brace.round.ts\"}},\"patterns\":[{\"include\":\"expression.ng\"}]},\"transition\":{\"match\":\"@\",\"name\":\"keyword.control.block.transition.ng\"}},\"scopeName\":\"template.blocks.ng\",\"embeddedLangs\":[\"angular-expression\",\"angular-template\"]}"))

export default [
...angular_expression,
...angular_template,
lang
]
