// re-export vite client types. with strict installers like pnpm, user won't
// be able to reference vite/client in project root.
/// <reference types="vite/client" />

export * from './dist/client/index.js'
