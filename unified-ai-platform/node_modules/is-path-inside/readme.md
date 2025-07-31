# is-path-inside

> Check if a path is inside another path


## Install

```
$ npm install is-path-inside
```


## Usage

```js
const isPathInside = require('is-path-inside');

isPathInside('a/b/c', 'a/b');
//=> true

isPathInside('a/b/c', 'x/y');
//=> false

isPathInside('a/b/c', 'a/b/c');
//=> false

isPathInside('/Users/sindresorhus/dev/unicorn', '/Users/sindresorhus');
//=> true
```


## API

### isPathInside(childPath, parentPath)

Note that relative paths are resolved against `process.cwd()` to make them absolute.

**Important:** This package is meant for use with path manipulation. It does not check if the paths exist nor does it resolve symlinks. You should not use this as a security mechanism to guard against access to certain places on the file system.

#### childPath

Type: `string`

The path that should be inside `parentPath`.

#### parentPath

Type: `string`

The path that should contain `childPath`.


---

<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/npm-is-path-inside?utm_source=npm-is-path-inside&utm_medium=referral&utm_campaign=readme">Get professional support for this package with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>
