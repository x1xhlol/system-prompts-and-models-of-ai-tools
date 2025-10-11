import html from './html.mjs'

const lang = Object.freeze(JSON.parse("{\"displayName\":\"jinja-html\",\"firstLineMatch\":\"^{% extends [\\\"'][^\\\"']+[\\\"'] %}\",\"foldingStartMarker\":\"(<(?i:(head|table|tr|div|style|script|ul|ol|form|dl))\\\\b.*?>|{%\\\\s*(block|filter|for|if|macro|raw))\",\"foldingStopMarker\":\"(</(?i:(head|table|tr|div|style|script|ul|ol|form|dl))\\\\b.*?>|{%\\\\s*(endblock|endfilter|endfor|endif|endmacro|endraw)\\\\s*%})\",\"name\":\"jinja-html\",\"patterns\":[{\"include\":\"source.jinja\"},{\"include\":\"text.html.basic\"}],\"scopeName\":\"text.html.jinja\",\"embeddedLangs\":[\"html\"]}"))

export default [
...html,
lang
]
