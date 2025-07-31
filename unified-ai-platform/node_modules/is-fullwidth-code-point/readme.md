# is-fullwidth-code-point

> Check if the character represented by a given [Unicode code point](https://en.wikipedia.org/wiki/Code_point) is [fullwidth](https://en.wikipedia.org/wiki/Halfwidth_and_fullwidth_forms)

## Install

```
$ npm install is-fullwidth-code-point
```

## Usage

```js
import isFullwidthCodePoint from 'is-fullwidth-code-point';

isFullwidthCodePoint('谢'.codePointAt(0));
//=> true

isFullwidthCodePoint('a'.codePointAt(0));
//=> false
```

## API

### isFullwidthCodePoint(codePoint)

#### codePoint

Type: `number`

The [code point](https://en.wikipedia.org/wiki/Code_point) of a character.

---

<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/npm-is-fullwidth-code-point?utm_source=npm-is-fullwidth-code-point&utm_medium=referral&utm_campaign=readme">Get professional support for this package with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>
