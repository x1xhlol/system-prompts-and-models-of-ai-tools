import scss from './scss.mjs'

const lang = Object.freeze(JSON.parse("{\"injectTo\":[\"source.ts.ng\"],\"injectionSelector\":\"L:source.ts#meta.decorator.ts -comment\",\"name\":\"angular-inline-style\",\"patterns\":[{\"include\":\"#inlineStyles\"}],\"repository\":{\"inlineStyles\":{\"begin\":\"(styles)\\\\s*(:)\",\"beginCaptures\":{\"1\":{\"name\":\"meta.object-literal.key.ts\"},\"2\":{\"name\":\"meta.object-literal.key.ts punctuation.separator.key-value.ts\"}},\"end\":\"(?=,|})\",\"patterns\":[{\"include\":\"#tsParenExpression\"},{\"include\":\"#tsBracketExpression\"},{\"include\":\"#style\"}]},\"style\":{\"begin\":\"\\\\s*([`|'|\\\"])\",\"beginCaptures\":{\"1\":{\"name\":\"string\"}},\"contentName\":\"source.css.scss\",\"end\":\"\\\\1\",\"endCaptures\":{\"0\":{\"name\":\"string\"}},\"patterns\":[{\"include\":\"source.css.scss\"}]},\"tsBracketExpression\":{\"begin\":\"\\\\G\\\\s*(\\\\[)\",\"beginCaptures\":{\"1\":{\"name\":\"meta.array.literal.ts meta.brace.square.ts\"}},\"end\":\"\\\\]\",\"endCaptures\":{\"0\":{\"name\":\"meta.array.literal.ts meta.brace.square.ts\"}},\"patterns\":[{\"include\":\"#style\"}]},\"tsParenExpression\":{\"begin\":\"\\\\G\\\\s*(\\\\()\",\"beginCaptures\":{\"1\":{\"name\":\"meta.brace.round.ts\"}},\"end\":\"\\\\)\",\"endCaptures\":{\"0\":{\"name\":\"meta.brace.round.ts\"}},\"patterns\":[{\"include\":\"$self\"},{\"include\":\"#tsBracketExpression\"},{\"include\":\"#style\"}]}},\"scopeName\":\"inline-styles.ng\",\"embeddedLangs\":[\"scss\"]}"))

export default [
...scss,
lang
]
