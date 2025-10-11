import angular_expression from './angular-expression.mjs'

const lang = Object.freeze(JSON.parse("{\"injectTo\":[\"text.html.derivative\",\"text.html.derivative.ng\",\"source.ts.ng\"],\"injectionSelector\":\"L:text.html -comment -expression.ng -meta.tag -source.css -source.js\",\"name\":\"angular-let-declaration\",\"patterns\":[{\"include\":\"#letDeclaration\"}],\"repository\":{\"letDeclaration\":{\"begin\":\"(@let)\\\\s+([_$[:alpha:]][_$[:alnum:]]*)\\\\s*(=)?\",\"beginCaptures\":{\"1\":{\"name\":\"storage.type.ng\"},\"2\":{\"name\":\"meta.definition.variable.ng\"},\"3\":{\"name\":\"keyword.operator.assignment.ng\"}},\"contentName\":\"meta.definition.variable.ng\",\"end\":\"(?<=;)\",\"patterns\":[{\"include\":\"#letInitializer\"}]},\"letInitializer\":{\"begin\":\"\\\\s*\",\"beginCaptures\":{\"0\":{\"name\":\"keyword.operator.assignment.ng\"}},\"contentName\":\"meta.definition.variable.initializer.ng\",\"end\":\";\",\"endCaptures\":{\"0\":{\"name\":\"punctuation.terminator.statement.ng\"}},\"patterns\":[{\"include\":\"expression.ng\"}]}},\"scopeName\":\"template.let.ng\",\"embeddedLangs\":[\"angular-expression\"]}"))

export default [
...angular_expression,
lang
]
