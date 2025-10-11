warnCjsUsage()

// type utils
module.exports.defineConfig = (config) => config

// proxy cjs utils (sync functions)
Object.assign(module.exports, require('./dist/node-cjs/publicUtils.cjs'))

// async functions, can be redirect from ESM build
const asyncFunctions = [
  'build',
  'createServer',
  'preview',
  'transformWithEsbuild',
  'resolveConfig',
  'optimizeDeps',
  'formatPostcssSourceMap',
  'loadConfigFromFile',
  'preprocessCSS',
]
asyncFunctions.forEach((name) => {
  module.exports[name] = (...args) =>
    import('./dist/node/index.js').then((i) => i[name](...args))
})

function warnCjsUsage() {
  if (process.env.VITE_CJS_IGNORE_WARNING) return
  const logLevelIndex = process.argv.findIndex((arg) =>
    /^(?:-l|--logLevel)/.test(arg),
  )
  if (logLevelIndex > 0) {
    const logLevelValue = process.argv[logLevelIndex + 1]
    if (logLevelValue === 'silent' || logLevelValue === 'error') {
      return
    }
    if (/silent|error/.test(process.argv[logLevelIndex])) {
      return
    }
  }
  const yellow = (str) => `\u001b[33m${str}\u001b[39m`
  console.warn(
    yellow(
      `The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.`,
    ),
  )
  if (process.env.VITE_CJS_TRACE) {
    const e = {}
    const stackTraceLimit = Error.stackTraceLimit
    Error.stackTraceLimit = 100
    Error.captureStackTrace(e)
    Error.stackTraceLimit = stackTraceLimit
    console.log(
      e.stack
        .split('\n')
        .slice(1)
        .filter((line) => !line.includes('(node:'))
        .join('\n'),
    )
  }
}
