## Fork of [`microsoft/vscode-textmate`](https://github.com/microsoft/vscode-textmate)

Changes make in this fork:

- Change all `async` operations to `sync`; `onigLib` option now required to be resolved instead of a promise.
- Use `tsup` to bundle the lib, ship as a single file ES module.
- Remove debug flags and some other unnecessary exports.
- Convert `EncodedTokenAttributes` from namespace to class, rename to `EncodedTokenMetadata`
- Support RegExp literals in grammar object ([#3](https://github.com/shikijs/vscode-textmate/pull/3))
