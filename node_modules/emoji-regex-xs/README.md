# emoji-regex-xs

This is a drop-in replacement for the [`emoji-regex`](https://github.com/mathiasbynens/emoji-regex) package that shares its API and passes all of its emoji tests, but reduces its uncompressed size by more than 97% (from ~13 KB to 0.3 KB). As a tradeoff for the smaller size, it relies on the regex `u` flag which requires Node.js 10+ or a browser from 2016 or later.

There are two additional small differences:

- `emoji-regex-xs` uses whatever version of Unicode that your browser or environment supports natively to determine the base list of emoji, whereas specific versions of `emoji-regex` are tied to specific Unicode versions.
- `emoji-regex-xs`, due to its use of a general pattern, matches some additional emoji that are supported on some but not all platforms, like [women wrestling: light skin tone](https://emojipedia.org/women-wrestling-light-skin-tone#designs) and [flag for Texas](https://emojipedia.org/flag-for-texas-ustx#designs).

## Install and use

Via npm:

```sh
npm install emoji-regex-xs
```

In Node.js:<br>
(This is copied from `emoji-regex` to show that it works the same.)

```js
const emojiRegex = require('emoji-regex-xs');
// Or: import emojiRegex from 'emoji-regex-xs';

// Note: because the regular expression has the global flag set, this module
// exports a function that returns the regex rather than exporting the regular
// expression itself, to make it impossible to (accidentally) mutate the
// original regular expression.

const text = `
\u{231A}: ⌚ default emoji presentation character (Emoji_Presentation)
\u{2194}\u{FE0F}: ↔️ default text presentation character rendered as emoji
\u{1F469}: 👩 emoji modifier base (Emoji_Modifier_Base)
\u{1F469}\u{1F3FF}: 👩🏿 emoji modifier base followed by a modifier
`;

const regex = emojiRegex();
for (const match of text.matchAll(regex)) {
  const emoji = match[0];
  console.log(`Matched sequence ${emoji} — code points: ${[...emoji].length}`);
}
```

Console output:

```js
Matched sequence ⌚ — code points: 1
Matched sequence ⌚ — code points: 1
Matched sequence ↔️ — code points: 2
Matched sequence ↔️ — code points: 2
Matched sequence 👩 — code points: 1
Matched sequence 👩 — code points: 1
Matched sequence 👩🏿 — code points: 2
Matched sequence 👩🏿 — code points: 2
```

## More details about emoji, Unicode properties, and regexes

Emoji are complicated. Or more specifically, how they're defined in the Unicode Standard is complicated. So writing a regex that matches all/only emoji is also complicated. For starters, individual emoji can be made up of between one and *many* Unicode code points, and there are a variety of different sequence patterns. There are also a variety of Unicode symbols, dingbats, etc. that are not emoji, that we don't want to match.

Given the complexity, many libraries that roll their own emoji regex get it very wrong, e.g. by matching emoji fragments that split off some of their attributes, or by matching things like digits (0, 1, 2, …), #, \*, or certain invisible characters. These characters are obviously not emoji, but they're matched by naive patterns because they might *become* emoji when followed by various combining characters. Or they might be special characters used in some emoji sequences while not being emoji on their own.

ES2018 added support for matching Unicode properties in regular expressions with `\p{…}`, so you might think this problem is now trivial, given that the list of supported properties includes `Emoji`, `Emoji_Presentation`, `Emoji_Modifier`, `Emoji_Modifier_Base`, `Emoji_Component`, and `Extended_Pictographic`. But no. On their own, none of these are what you want.

ES2024 added support for matching multicharacter Unicode *properties of strings* with `\p{…}`, so you might think one of the new properties `Basic_Emoji`, `Emoji_Keycap_Sequence`, `RGI_Emoji_Modifier_Sequence`, `RGI_Emoji_Flag_Sequence`, `RGI_Emoji_Tag_Sequence`, `RGI_Emoji_ZWJ_Sequence`, or `RGI_Emoji` will do the trick. Well, kind of. `RGI_Emoji` indeed seems like what we want, but unfortunately, some common-sense and broadly-supported emoji are not officially in the "RGI" (Recommended for General Interchange) list. And even more frustratingly, some emoji are commonly used in an underqualified or overqualified way (by including or excluding certain invisible Unicode markers) that prevents them from being matched by `RGI_Emoji`. For example, the iOS emoji keyboard overqualifies certain emoji. So we need something that matches everything in `RGI_Emoji`, and more. Additionally, `\p{RGI_Emoji}` relies on flag `v` which is only supported by 2023-era browsers and Node.js 20+.

All of this is why the extremely popular `emoji-regex` package exists. It does a great job of accurately matching most common-sense emoji. But to do so, it uses a gigantic (~13 KB uncompressed) regex that hard codes a list of Unicode code points that are tied to a specific Unicode version. Conversely, `emoji-regex-xs` uses a general pattern that continues to be highly accurate in matching all/only emoji, but uses only ~0.3 KB to do so. It follows `emoji-regex`'s API and reuses its tests, so it can be swapped-in as a replacement.

<!-- `emoji-regex-xs` started based on [this discussion](https://github.com/mathiasbynens/rgi-emoji-regex-pattern/issues/3). -->
