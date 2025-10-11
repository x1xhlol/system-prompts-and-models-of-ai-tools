import typescript from './typescript.mjs'
import es_tag_css from './es-tag-css.mjs'
import es_tag_glsl from './es-tag-glsl.mjs'
import es_tag_html from './es-tag-html.mjs'
import es_tag_sql from './es-tag-sql.mjs'
import es_tag_xml from './es-tag-xml.mjs'

const lang = Object.freeze(JSON.parse("{\"displayName\":\"TypeScript with Tags\",\"name\":\"ts-tags\",\"patterns\":[{\"include\":\"source.ts\"}],\"scopeName\":\"source.ts.tags\",\"embeddedLangs\":[\"typescript\",\"es-tag-css\",\"es-tag-glsl\",\"es-tag-html\",\"es-tag-sql\",\"es-tag-xml\"],\"aliases\":[\"lit\"]}"))

export default [
...typescript,
...es_tag_css,
...es_tag_glsl,
...es_tag_html,
...es_tag_sql,
...es_tag_xml,
lang
]
