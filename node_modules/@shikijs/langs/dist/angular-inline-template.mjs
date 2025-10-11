import angular_html from './angular-html.mjs'
import angular_template from './angular-template.mjs'

const lang = Object.freeze(JSON.parse("{\"injectTo\":[\"source.ts.ng\"],\"injectionSelector\":\"L:meta.decorator.ts -comment -text.html\",\"name\":\"angular-inline-template\",\"patterns\":[{\"include\":\"#inlineTemplate\"}],\"repository\":{\"inlineTemplate\":{\"begin\":\"(template)\\\\s*(:)\",\"beginCaptures\":{\"1\":{\"name\":\"meta.object-literal.key.ts\"},\"2\":{\"name\":\"meta.object-literal.key.ts punctuation.separator.key-value.ts\"}},\"end\":\"(?=,|})\",\"patterns\":[{\"include\":\"#tsParenExpression\"},{\"include\":\"#ngTemplate\"}]},\"ngTemplate\":{\"begin\":\"\\\\G\\\\s*([`|'|\\\"])\",\"beginCaptures\":{\"1\":{\"name\":\"string\"}},\"contentName\":\"text.html.derivative.ng\",\"end\":\"\\\\1\",\"endCaptures\":{\"0\":{\"name\":\"string\"}},\"patterns\":[{\"include\":\"text.html.derivative.ng\"},{\"include\":\"template.ng\"}]},\"tsParenExpression\":{\"begin\":\"\\\\G\\\\s*(\\\\()\",\"beginCaptures\":{\"1\":{\"name\":\"meta.brace.round.ts\"}},\"end\":\"\\\\)\",\"endCaptures\":{\"0\":{\"name\":\"meta.brace.round.ts\"}},\"patterns\":[{\"include\":\"#tsParenExpression\"},{\"include\":\"#ngTemplate\"}]}},\"scopeName\":\"inline-template.ng\",\"embeddedLangs\":[\"angular-html\",\"angular-template\"]}"))

export default [
...angular_html,
...angular_template,
lang
]
