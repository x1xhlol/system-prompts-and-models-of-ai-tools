import typescript from './typescript.mjs'
import sql from './sql.mjs'

const lang = Object.freeze(JSON.parse("{\"fileTypes\":[\"js\",\"jsx\",\"ts\",\"tsx\",\"html\",\"vue\",\"svelte\",\"php\",\"res\"],\"injectTo\":[\"source.ts\",\"source.js\"],\"injectionSelector\":\"L:source.js -comment -string, L:source.jsx -comment -string,  L:source.js.jsx -comment -string, L:source.ts -comment -string, L:source.tsx -comment -string, L:source.rescript -comment -string\",\"injections\":{\"L:source\":{\"patterns\":[{\"match\":\"<\",\"name\":\"invalid.illegal.bad-angle-bracket.html\"}]}},\"name\":\"es-tag-sql\",\"patterns\":[{\"begin\":\"(?i)\\\\b(\\\\w+\\\\.sql)\\\\s*(`)\",\"beginCaptures\":{\"1\":{\"name\":\"variable.parameter\"}},\"end\":\"(`)\",\"patterns\":[{\"include\":\"source.ts#template-substitution-element\"},{\"include\":\"source.ts#string-character-escape\"},{\"include\":\"source.sql\"},{\"include\":\"source.plpgsql.postgres\"},{\"match\":\".\"}]},{\"begin\":\"(?i)(\\\\s?\\\\/?\\\\*?\\\\s?(sql|inline-sql)\\\\s?\\\\*?\\\\/?\\\\s?)(`)\",\"beginCaptures\":{\"1\":{\"name\":\"comment.block\"}},\"end\":\"(`)\",\"patterns\":[{\"include\":\"source.ts#template-substitution-element\"},{\"include\":\"source.ts#string-character-escape\"},{\"include\":\"source.sql\"},{\"include\":\"source.plpgsql.postgres\"},{\"match\":\".\"}]},{\"begin\":\"(?i)(?<=\\\\s|\\\\,|\\\\=|\\\\:|\\\\(|\\\\$\\\\()\\\\s{0,}(((\\\\/\\\\*)|(\\\\/\\\\/))\\\\s?(sql|inline-sql)[ ]{0,1000}\\\\*?\\\\/?)[ ]{0,1000}$\",\"beginCaptures\":{\"1\":{\"name\":\"comment.line\"}},\"end\":\"(`)\",\"patterns\":[{\"begin\":\"(\\\\G)\",\"end\":\"(`)\"},{\"include\":\"source.ts#template-substitution-element\"},{\"include\":\"source.ts#string-character-escape\"},{\"include\":\"source.sql\"},{\"include\":\"source.plpgsql.postgres\"},{\"match\":\".\"}]}],\"scopeName\":\"inline.es6-sql\",\"embeddedLangs\":[\"typescript\",\"sql\"]}"))

export default [
...typescript,
...sql,
lang
]
