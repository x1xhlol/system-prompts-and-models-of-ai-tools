import typescript from './typescript.mjs'
import css from './css.mjs'
import javascript from './javascript.mjs'

const lang = Object.freeze(JSON.parse("{\"fileTypes\":[\"js\",\"jsx\",\"ts\",\"tsx\",\"html\",\"vue\",\"svelte\",\"php\",\"res\"],\"injectTo\":[\"source.ts\",\"source.js\"],\"injectionSelector\":\"L:source.js -comment -string, L:source.js -comment -string, L:source.jsx -comment -string,  L:source.js.jsx -comment -string, L:source.ts -comment -string, L:source.tsx -comment -string, L:source.rescript -comment -string, L:source.vue -comment -string, L:source.svelte -comment -string, L:source.php -comment -string, L:source.rescript -comment -string\",\"injections\":{\"L:source\":{\"patterns\":[{\"match\":\"<\",\"name\":\"invalid.illegal.bad-angle-bracket.html\"}]}},\"name\":\"es-tag-css\",\"patterns\":[{\"begin\":\"(?i)(\\\\s?\\\\/\\\\*\\\\s?(css|inline-css)\\\\s?\\\\*\\\\/\\\\s?)(`)\",\"beginCaptures\":{\"1\":{\"name\":\"comment.block\"}},\"end\":\"(`)\",\"patterns\":[{\"include\":\"source.ts#template-substitution-element\"},{\"include\":\"source.css\"},{\"include\":\"inline.es6-htmlx#template\"}]},{\"begin\":\"(?i)(\\\\s*(css|inline-css))(`)\",\"beginCaptures\":{\"1\":{\"name\":\"comment.block\"}},\"end\":\"(`)\",\"patterns\":[{\"include\":\"source.ts#template-substitution-element\"},{\"include\":\"source.css\"},{\"include\":\"inline.es6-htmlx#template\"},{\"include\":\"string.quoted.other.template.js\"}]},{\"begin\":\"(?i)(?<=\\\\s|\\\\,|\\\\=|\\\\:|\\\\(|\\\\$\\\\()\\\\s{0,}(((\\\\/\\\\*)|(\\\\/\\\\/))\\\\s?(css|inline-css)[ ]{0,1000}\\\\*?\\\\/?)[ ]{0,1000}$\",\"beginCaptures\":{\"1\":{\"name\":\"comment.line\"}},\"end\":\"(`).*\",\"patterns\":[{\"begin\":\"(\\\\G)\",\"end\":\"(`)\"},{\"include\":\"source.ts#template-substitution-element\"},{\"include\":\"source.css\"}]},{\"begin\":\"(\\\\${)\",\"beginCaptures\":{\"1\":{\"name\":\"entity.name.tag\"}},\"end\":\"(})\",\"endCaptures\":{\"1\":{\"name\":\"entity.name.tag\"}},\"patterns\":[{\"include\":\"source.ts#template-substitution-element\"},{\"include\":\"source.js\"}]}],\"scopeName\":\"inline.es6-css\",\"embeddedLangs\":[\"typescript\",\"css\",\"javascript\"]}"))

export default [
...typescript,
...css,
...javascript,
lang
]
