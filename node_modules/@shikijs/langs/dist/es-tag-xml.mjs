import xml from './xml.mjs'

const lang = Object.freeze(JSON.parse("{\"fileTypes\":[\"js\",\"jsx\",\"ts\",\"tsx\",\"html\",\"vue\",\"svelte\",\"php\",\"res\"],\"injectTo\":[\"source.ts\",\"source.js\"],\"injectionSelector\":\"L:source.js -comment -string, L:source.js -comment -string, L:source.jsx -comment -string,  L:source.js.jsx -comment -string, L:source.ts -comment -string, L:source.tsx -comment -string, L:source.rescript -comment -string\",\"injections\":{\"L:source\":{\"patterns\":[{\"match\":\"<\",\"name\":\"invalid.illegal.bad-angle-bracket.html\"}]}},\"name\":\"es-tag-xml\",\"patterns\":[{\"begin\":\"(?i)(\\\\s?\\\\/\\\\*\\\\s?(xml|svg|inline-svg|inline-xml)\\\\s?\\\\*\\\\/\\\\s?)(`)\",\"beginCaptures\":{\"1\":{\"name\":\"comment.block\"}},\"end\":\"(`)\",\"patterns\":[{\"include\":\"text.xml\"}]},{\"begin\":\"(?i)(\\\\s*(xml|inline-xml))(`)\",\"beginCaptures\":{\"1\":{\"name\":\"comment.block\"}},\"end\":\"(`)\",\"patterns\":[{\"include\":\"text.xml\"}]},{\"begin\":\"(?i)(?<=\\\\s|\\\\,|\\\\=|\\\\:|\\\\(|\\\\$\\\\()\\\\s{0,}(((\\\\/\\\\*)|(\\\\/\\\\/))\\\\s?(xml|svg|inline-svg|inline-xml)[ ]{0,1000}\\\\*?\\\\/?)[ ]{0,1000}$\",\"beginCaptures\":{\"1\":{\"name\":\"comment.line\"}},\"end\":\"(`).*\",\"patterns\":[{\"begin\":\"(\\\\G)\",\"end\":\"(`)\"},{\"include\":\"text.xml\"}]}],\"scopeName\":\"inline.es6-xml\",\"embeddedLangs\":[\"xml\"]}"))

export default [
...xml,
lang
]
