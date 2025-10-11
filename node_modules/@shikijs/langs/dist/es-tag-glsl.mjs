import typescript from './typescript.mjs'
import glsl from './glsl.mjs'
import javascript from './javascript.mjs'

const lang = Object.freeze(JSON.parse("{\"fileTypes\":[\"js\",\"jsx\",\"ts\",\"tsx\",\"html\",\"vue\",\"svelte\",\"php\",\"res\"],\"injectTo\":[\"source.ts\",\"source.js\"],\"injectionSelector\":\"L:source.js -comment -string, L:source.js -comment -string, L:source.jsx -comment -string,  L:source.js.jsx -comment -string, L:source.ts -comment -string, L:source.tsx -comment -string, L:source.rescript -comment -string\",\"injections\":{\"L:source\":{\"patterns\":[{\"match\":\"<\",\"name\":\"invalid.illegal.bad-angle-bracket.html\"}]}},\"name\":\"es-tag-glsl\",\"patterns\":[{\"begin\":\"(?i)(\\\\s?\\\\/\\\\*\\\\s?(glsl|inline-glsl)\\\\s?\\\\*\\\\/\\\\s?)(`)\",\"beginCaptures\":{\"1\":{\"name\":\"comment.block\"}},\"end\":\"(`)\",\"patterns\":[{\"include\":\"source.ts#template-substitution-element\"},{\"include\":\"source.glsl\"},{\"include\":\"inline.es6-htmlx#template\"}]},{\"begin\":\"(?i)(\\\\s*(glsl|inline-glsl))(`)\",\"beginCaptures\":{\"1\":{\"name\":\"comment.block\"}},\"end\":\"(`)\",\"patterns\":[{\"include\":\"source.ts#template-substitution-element\"},{\"include\":\"source.glsl\"},{\"include\":\"inline.es6-htmlx#template\"},{\"include\":\"string.quoted.other.template.js\"}]},{\"begin\":\"(?i)(?<=\\\\s|\\\\,|\\\\=|\\\\:|\\\\(|\\\\$\\\\()\\\\s{0,}(((\\\\/\\\\*)|(\\\\/\\\\/))\\\\s?(glsl|inline-glsl)[ ]{0,1000}\\\\*?\\\\/?)[ ]{0,1000}$\",\"beginCaptures\":{\"1\":{\"name\":\"comment.line\"}},\"end\":\"(`).*\",\"patterns\":[{\"begin\":\"(\\\\G)\",\"end\":\"(`)\"},{\"include\":\"source.ts#template-substitution-element\"},{\"include\":\"source.glsl\"}]},{\"begin\":\"(\\\\${)\",\"beginCaptures\":{\"1\":{\"name\":\"entity.name.tag\"}},\"end\":\"(})\",\"endCaptures\":{\"1\":{\"name\":\"entity.name.tag\"}},\"patterns\":[{\"include\":\"source.ts#template-substitution-element\"},{\"include\":\"source.js\"}]}],\"scopeName\":\"inline.es6-glsl\",\"embeddedLangs\":[\"typescript\",\"glsl\",\"javascript\"]}"))

export default [
...typescript,
...glsl,
...javascript,
lang
]
