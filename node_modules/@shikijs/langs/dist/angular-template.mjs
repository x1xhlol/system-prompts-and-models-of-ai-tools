import angular_expression from './angular-expression.mjs'

const lang = Object.freeze(JSON.parse("{\"injectTo\":[\"text.html.derivative\",\"text.html.derivative.ng\",\"source.ts.ng\"],\"injectionSelector\":\"L:text.html -comment\",\"name\":\"angular-template\",\"patterns\":[{\"include\":\"#interpolation\"}],\"repository\":{\"interpolation\":{\"begin\":\"{{\",\"beginCaptures\":{\"0\":{\"name\":\"punctuation.definition.block.ts\"}},\"contentName\":\"expression.ng\",\"end\":\"}}\",\"endCaptures\":{\"0\":{\"name\":\"punctuation.definition.block.ts\"}},\"patterns\":[{\"include\":\"expression.ng\"}]}},\"scopeName\":\"template.ng\",\"embeddedLangs\":[\"angular-expression\"]}"))

export default [
...angular_expression,
lang
]
