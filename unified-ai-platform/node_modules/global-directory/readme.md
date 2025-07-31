# global-directory

> Get the directory of globally installed packages and binaries

Uses the same resolution logic as `npm` and `yarn`.

## Install

```sh
npm install global-directory
```

## Usage

```js
import globalDirectory from 'global-directory';

console.log(globalDirectory.npm.prefix);
//=> '/usr/local'

console.log(globalDirectory.npm.packages);
//=> '/usr/local/lib/node_modules'

console.log(globalDirectory.npm.binaries);
//=> '/usr/local/bin'

console.log(globalDirectory.yarn.packages);
//=> '/Users/sindresorhus/.config/yarn/global/node_modules'
```

## API

### globalDirectory

#### npm
#### yarn

##### packages

The directory with globally installed packages.

Equivalent to `npm root --global`.

##### binaries

The directory with globally installed binaries.

Equivalent to `npm bin --global`.

##### prefix

The directory with directories for packages and binaries. You probably want either of the above.

Equivalent to `npm prefix --global`.

## Related

- [import-global](https://github.com/sindresorhus/import-global) - Import a globally installed module
- [resolve-global](https://github.com/sindresorhus/resolve-global) - Resolve the path of a globally installed module
- [is-installed-globally](https://github.com/sindresorhus/is-installed-globally) - Check if your package was installed globally
