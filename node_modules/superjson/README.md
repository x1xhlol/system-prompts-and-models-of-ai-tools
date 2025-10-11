<p align="center">
  <img alt="superjson" src="./docs/superjson-banner.png" width="800" />
</p>

<p align="center">
  Safely serialize JavaScript expressions to a superset of JSON, which includes Dates, BigInts, and more.
</p>

<p align="center">
  <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors"><img src="https://img.shields.io/badge/all_contributors-31-orange.svg?style=flat-square" alt="All Contributors"/></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
  <a href="https://www.npmjs.com/package/superjson">
    <img alt="npm" src="https://img.shields.io/npm/v/superjson" />
  </a>
  <a href="https://lgtm.com/projects/g/blitz-js/superjson/context:javascript">
    <img
      alt="Language grade: JavaScript"
      src="https://img.shields.io/lgtm/grade/javascript/g/blitz-js/superjson.svg?logo=lgtm&logoWidth=18"
    />
  </a>

  <a href="https://github.com/blitz-js/superjson/actions">
    <img
      alt="CI"
      src="https://github.com/blitz-js/superjson/workflows/CI/badge.svg"
    />
  </a>
</p>

## Key features

- 🍱 Reliable serialization and deserialization
- 🔐 Type safety with autocompletion
- 🐾 Negligible runtime footprint
- 💫 Framework agnostic
- 🛠 Perfect fix for Next.js's serialisation limitations in `getServerSideProps` and `getInitialProps`

## Backstory

At [Blitz](https://github.com/blitz-js/blitz), we have struggled with the limitations of JSON. We often find ourselves working with `Date`, `Map`, `Set` or `BigInt`, but `JSON.stringify` doesn't support any of them without going through the hassle of converting manually!

Superjson solves these issues by providing a thin wrapper over `JSON.stringify` and `JSON.parse`.

## Sponsors

[<img src="https://raw.githubusercontent.com/blitz-js/blitz/main/assets/flightcontrol.png" alt="Flightcontrol Logo" style="width: 400px;"/>](https://www.flightcontrol.dev/?ref=superjson)

Superjson logo by [NUMI](https://github.com/numi-hq/open-design):

[<img src="https://raw.githubusercontent.com/numi-hq/open-design/main/assets/numi-lockup.png" alt="NUMI Logo" style="width: 200px;"/>](https://numi.tech/?ref=superjson)

## Getting started

Install the library with your package manager of choice, e.g.:

```
yarn add superjson
```

## Basic Usage

The easiest way to use Superjson is with its `stringify` and `parse` functions. If you know how to use `JSON.stringify`, you already know Superjson!

Easily stringify any expression you’d like:

```js
import superjson from 'superjson';

const jsonString = superjson.stringify({ date: new Date(0) });

// jsonString === '{"json":{"date":"1970-01-01T00:00:00.000Z"},"meta":{"values":{date:"Date"}}}'
```

And parse your JSON like so:

```js
const object = superjson.parse<
{ date: Date }
>(jsonString);

// object === { date: new Date(0) }
```

## Advanced Usage

For cases where you want lower level access to the `json` and `meta` data in the output, you can use the `serialize` and `deserialize` functions.

One great use case for this is where you have an API that you want to be JSON compatible for all clients, but you still also want to transmit the meta data so clients can use superjson to fully deserialize it.

For example:

```js
const object = {
  normal: 'string',
  timestamp: new Date(),
  test: /superjson/,
};

const { json, meta } = superjson.serialize(object);

/*
json = {
  normal: 'string',
  timestamp: "2020-06-20T04:56:50.293Z",
  test: "/superjson/",
};

// note that `normal` is not included here; `meta` only has special cases
meta = {
  values: {
    timestamp: ['Date'],
    test: ['regexp'],
  }
};
*/
```

## Using with Next.js

The `getServerSideProps`, `getInitialProps`, and `getStaticProps` data hooks provided by Next.js do not allow you to transmit Javascript objects like Dates. It will error unless you convert Dates to strings, etc.

Thankfully, Superjson is a perfect tool to bypass that limitation!

### Next.js SWC Plugin (experimental, v13 or above)

Next.js SWC plugins are [experimental](https://nextjs.org/docs/advanced-features/compiler#swc-plugins-experimental), but promise a significant speedup.
To use the [SuperJSON SWC plugin](https://github.com/blitz-js/next-superjson-plugin), install it and add it to your `next.config.js`:

```sh
yarn add next-superjson-plugin
```

```js
// next.config.js
module.exports = {
  experimental: {
    swcPlugins: [
      [
        'next-superjson-plugin',
        {
          excluded: [],
        },
      ],
    ],
  },
};
```

### Next.js (stable Babel transform)

Install the library with your package manager of choice, e.g.:

```sh
yarn add babel-plugin-superjson-next
```

Add the plugin to your .babelrc. If you don't have one, create it.

```js
{
  "presets": ["next/babel"],
  "plugins": [
    ...
    "superjson-next" // 👈
  ]
}
```

Done! Now you can safely use all JS datatypes in your `getServerSideProps` / etc. .

## API

### serialize

Serializes any JavaScript value into a JSON-compatible object.

#### Examples

```js
const object = {
  normal: 'string',
  timestamp: new Date(),
  test: /superjson/,
};

const { json, meta } = serialize(object);
```

Returns **`json` and `meta`, both JSON-compatible values.**

## deserialize

Deserializes the output of Superjson back into your original value.

#### Examples

```js
const { json, meta } = serialize(object);

deserialize({ json, meta });
```

Returns **`your original value`**.

### stringify

Serializes and then stringifies your JavaScript value.

#### Examples

```js
const object = {
  normal: 'string',
  timestamp: new Date(),
  test: /superjson/,
};

const jsonString = stringify(object);
```

Returns **`string`**.

### parse

Parses and then deserializes the JSON string returned by `stringify`.

#### Examples

```js
const jsonString = stringify(object);

parse(jsonString);
```

Returns **`your original value`**.

---

Superjson supports many extra types which JSON does not. You can serialize all these:

| type        | supported by standard JSON? | supported by Superjson? |
| ----------- | --------------------------- | ----------------------- |
| `string`    | ✅                          | ✅                      |
| `number`    | ✅                          | ✅                      |
| `boolean`   | ✅                          | ✅                      |
| `null`      | ✅                          | ✅                      |
| `Array`     | ✅                          | ✅                      |
| `Object`    | ✅                          | ✅                      |
| `undefined` | ❌                          | ✅                      |
| `bigint`    | ❌                          | ✅                      |
| `Date`      | ❌                          | ✅                      |
| `RegExp`    | ❌                          | ✅                      |
| `Set`       | ❌                          | ✅                      |
| `Map`       | ❌                          | ✅                      |
| `Error`     | ❌                          | ✅                      |
| `URL`       | ❌                          | ✅                      |

## Recipes

SuperJSON by default only supports built-in data types to keep bundle-size as low as possible.
Here are some recipes you can use to extend to non-default data types.

Place them in some central utility file and make sure they're executed before any other `SuperJSON` calls.
In a Next.js project, `_app.ts` would be a good spot for that.

### `Decimal.js` / `Prisma.Decimal`

```ts
import { Decimal } from 'decimal.js';

SuperJSON.registerCustom<Decimal, string>(
  {
    isApplicable: (v): v is Decimal => Decimal.isDecimal(v),
    serialize: v => v.toJSON(),
    deserialize: v => new Decimal(v),
  },
  'decimal.js'
);
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/merelinguist"><img src="https://avatars3.githubusercontent.com/u/24858006?v=4?s=100" width="100px;" alt="Dylan Brookes"/><br /><sub><b>Dylan Brookes</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=merelinguist" title="Code">💻</a> <a href="https://github.com/blitz-js/superjson/commits?author=merelinguist" title="Documentation">📖</a> <a href="#design-merelinguist" title="Design">🎨</a> <a href="https://github.com/blitz-js/superjson/commits?author=merelinguist" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://simonknott.de"><img src="https://avatars1.githubusercontent.com/u/14912729?v=4?s=100" width="100px;" alt="Simon Knott"/><br /><sub><b>Simon Knott</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=Skn0tt" title="Code">💻</a> <a href="#ideas-Skn0tt" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/blitz-js/superjson/commits?author=Skn0tt" title="Tests">⚠️</a> <a href="https://github.com/blitz-js/superjson/commits?author=Skn0tt" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://twitter.com/flybayer"><img src="https://avatars3.githubusercontent.com/u/8813276?v=4?s=100" width="100px;" alt="Brandon Bayer"/><br /><sub><b>Brandon Bayer</b></sub></a><br /><a href="#ideas-flybayer" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://jeremyliberman.com/"><img src="https://avatars3.githubusercontent.com/u/2754163?v=4?s=100" width="100px;" alt="Jeremy Liberman"/><br /><sub><b>Jeremy Liberman</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=mrleebo" title="Tests">⚠️</a> <a href="https://github.com/blitz-js/superjson/commits?author=mrleebo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jorisre"><img src="https://avatars1.githubusercontent.com/u/7545547?v=4?s=100" width="100px;" alt="Joris"/><br /><sub><b>Joris</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=jorisre" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tomhooijenga"><img src="https://avatars0.githubusercontent.com/u/1853235?v=4?s=100" width="100px;" alt="tomhooijenga"/><br /><sub><b>tomhooijenga</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=tomhooijenga" title="Code">💻</a> <a href="https://github.com/blitz-js/superjson/issues?q=author%3Atomhooijenga" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://twitter.com/ftonato"><img src="https://avatars2.githubusercontent.com/u/5417662?v=4?s=100" width="100px;" alt="Ademílson F. Tonato"/><br /><sub><b>Ademílson F. Tonato</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=ftonato" title="Tests">⚠️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://haspar.us"><img src="https://avatars0.githubusercontent.com/u/15332326?v=4?s=100" width="100px;" alt="Piotr Monwid-Olechnowicz"/><br /><sub><b>Piotr Monwid-Olechnowicz</b></sub></a><br /><a href="#ideas-hasparus" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://kattcorp.com"><img src="https://avatars1.githubusercontent.com/u/459267?v=4?s=100" width="100px;" alt="Alex Johansson"/><br /><sub><b>Alex Johansson</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=KATT" title="Code">💻</a> <a href="https://github.com/blitz-js/superjson/commits?author=KATT" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/simonedelmann"><img src="https://avatars.githubusercontent.com/u/2821076?v=4?s=100" width="100px;" alt="Simon Edelmann"/><br /><sub><b>Simon Edelmann</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/issues?q=author%3Asimonedelmann" title="Bug reports">🐛</a> <a href="https://github.com/blitz-js/superjson/commits?author=simonedelmann" title="Code">💻</a> <a href="#ideas-simonedelmann" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.samgarson.com"><img src="https://avatars.githubusercontent.com/u/6242344?v=4?s=100" width="100px;" alt="Sam Garson"/><br /><sub><b>Sam Garson</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/issues?q=author%3Asamtgarson" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://twitter.com/_markeh"><img src="https://avatars.githubusercontent.com/u/1357323?v=4?s=100" width="100px;" alt="Mark Hughes"/><br /><sub><b>Mark Hughes</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/issues?q=author%3Amarkhughes" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://blog.lxxyx.cn/"><img src="https://avatars.githubusercontent.com/u/13161470?v=4?s=100" width="100px;" alt="Lxxyx"/><br /><sub><b>Lxxyx</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=Lxxyx" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://maximomussini.com"><img src="https://avatars.githubusercontent.com/u/1158253?v=4?s=100" width="100px;" alt="Máximo Mussini"/><br /><sub><b>Máximo Mussini</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=ElMassimo" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://goodcode.nz"><img src="https://avatars.githubusercontent.com/u/425971?v=4?s=100" width="100px;" alt="Peter Dekkers"/><br /><sub><b>Peter Dekkers</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/issues?q=author%3APeterDekkers" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://goleary.com"><img src="https://avatars.githubusercontent.com/u/16123225?v=4?s=100" width="100px;" alt="Gabe O'Leary"/><br /><sub><b>Gabe O'Leary</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=goleary" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/binajmen"><img src="https://avatars.githubusercontent.com/u/15611419?v=4?s=100" width="100px;" alt="Benjamin"/><br /><sub><b>Benjamin</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=binajmen" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/icflorescu"><img src="https://avatars.githubusercontent.com/u/581999?v=4?s=100" width="100px;" alt="Ionut-Cristian Florescu"/><br /><sub><b>Ionut-Cristian Florescu</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/issues?q=author%3Aicflorescu" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/chrisj-back2work"><img src="https://avatars.githubusercontent.com/u/68551954?v=4?s=100" width="100px;" alt="Chris Johnson"/><br /><sub><b>Chris Johnson</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=chrisj-back2work" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://nicholaschiang.com"><img src="https://avatars.githubusercontent.com/u/20798889?v=4?s=100" width="100px;" alt="Nicholas Chiang"/><br /><sub><b>Nicholas Chiang</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/issues?q=author%3Anicholaschiang" title="Bug reports">🐛</a> <a href="https://github.com/blitz-js/superjson/commits?author=nicholaschiang" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/datner"><img src="https://avatars.githubusercontent.com/u/22598347?v=4?s=100" width="100px;" alt="Datner"/><br /><sub><b>Datner</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=datner" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ruessej"><img src="https://avatars.githubusercontent.com/u/85690286?v=4?s=100" width="100px;" alt="ruessej"/><br /><sub><b>ruessej</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/issues?q=author%3Aruessej" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://jins.dev"><img src="https://avatars.githubusercontent.com/u/39466936?v=4?s=100" width="100px;" alt="JH.Lee"/><br /><sub><b>JH.Lee</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=orionmiz" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://narumincho.notion.site"><img src="https://avatars.githubusercontent.com/u/16481886?v=4?s=100" width="100px;" alt="narumincho"/><br /><sub><b>narumincho</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=narumincho" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mgreystone"><img src="https://avatars.githubusercontent.com/u/12430681?v=4?s=100" width="100px;" alt="Markus Greystone"/><br /><sub><b>Markus Greystone</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/issues?q=author%3Amgreystone" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://gw2treasures.com/"><img src="https://avatars.githubusercontent.com/u/2511547?v=4?s=100" width="100px;" alt="darthmaim"/><br /><sub><b>darthmaim</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=darthmaim" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.maxmalm.se"><img src="https://avatars.githubusercontent.com/u/430872?v=4?s=100" width="100px;" alt="Max Malm"/><br /><sub><b>Max Malm</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=benjick" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tylercollier"><img src="https://avatars.githubusercontent.com/u/366538?v=4?s=100" width="100px;" alt="Tyler Collier"/><br /><sub><b>Tyler Collier</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=tylercollier" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kidqueb"><img src="https://avatars.githubusercontent.com/u/884128?v=4?s=100" width="100px;" alt="Nick Quebbeman"/><br /><sub><b>Nick Quebbeman</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/commits?author=kidqueb" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://macwright.com/"><img src="https://avatars.githubusercontent.com/u/32314?v=4?s=100" width="100px;" alt="Tom MacWright"/><br /><sub><b>Tom MacWright</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/issues?q=author%3Atmcw" title="Bug reports">🐛</a> <a href="https://github.com/blitz-js/superjson/commits?author=tmcw" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/peterbud"><img src="https://avatars.githubusercontent.com/u/7863452?v=4?s=100" width="100px;" alt="Peter Budai"/><br /><sub><b>Peter Budai</b></sub></a><br /><a href="https://github.com/blitz-js/superjson/issues?q=author%3Apeterbud" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## See also

Other libraries that aim to solve a similar problem:

- [Serialize JavaScript](https://github.com/yahoo/serialize-javascript) by Eric Ferraiuolo
- [devalue](https://github.com/Rich-Harris/devalue) by Rich Harris
- [next-json](https://github.com/iccicci/next-json) by Daniele Ricci
