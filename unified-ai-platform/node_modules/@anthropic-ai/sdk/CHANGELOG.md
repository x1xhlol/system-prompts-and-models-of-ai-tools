# Changelog

## 0.9.1 (2023-11-14)

Full Changelog: [v0.9.0...v0.9.1](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.9.0...v0.9.1)

### Chores

* **ci:** update release-please config ([#206](https://github.com/anthropics/anthropic-sdk-typescript/issues/206)) ([270b0b7](https://github.com/anthropics/anthropic-sdk-typescript/commit/270b0b725ea559ca4616ec8d8bac5a5cde1de0db))
* **docs:** fix github links ([#208](https://github.com/anthropics/anthropic-sdk-typescript/issues/208)) ([b316603](https://github.com/anthropics/anthropic-sdk-typescript/commit/b3166033cffe31f5d11793ddd32e595161f1a2e6))
* **internal:** update APIResource structure ([#211](https://github.com/anthropics/anthropic-sdk-typescript/issues/211)) ([0d6bbce](https://github.com/anthropics/anthropic-sdk-typescript/commit/0d6bbce8ff699b511133ee6bfb72c1244d85eb32))
* **internal:** update jest config ([#210](https://github.com/anthropics/anthropic-sdk-typescript/issues/210)) ([b0c64eb](https://github.com/anthropics/anthropic-sdk-typescript/commit/b0c64eb9531d417f024567a4c74d9dd64743b889))
* **internal:** update tsconfig ([#209](https://github.com/anthropics/anthropic-sdk-typescript/issues/209)) ([81b3e0b](https://github.com/anthropics/anthropic-sdk-typescript/commit/81b3e0b59801f737c6f1783e59eef8c1af77b1ad))

## 0.9.0 (2023-11-05)

Full Changelog: [v0.8.1...v0.9.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.8.1...v0.9.0)

### Features

* **client:** allow binary returns ([#203](https://github.com/anthropics/anthropic-sdk-typescript/issues/203)) ([5983d5e](https://github.com/anthropics/anthropic-sdk-typescript/commit/5983d5e5de327d6835c7baaea022914a101865a2))
* **github:** include a devcontainer setup ([#202](https://github.com/anthropics/anthropic-sdk-typescript/issues/202)) ([ea97913](https://github.com/anthropics/anthropic-sdk-typescript/commit/ea97913a04a508da7704758b78a9b96d097be5a2))


### Chores

* **internal:** update gitignore ([#198](https://github.com/anthropics/anthropic-sdk-typescript/issues/198)) ([3048738](https://github.com/anthropics/anthropic-sdk-typescript/commit/3048738235b9dff9de19aae59ff66487dffb9e8e))
* small cleanups ([#201](https://github.com/anthropics/anthropic-sdk-typescript/issues/201)) ([9f0a73d](https://github.com/anthropics/anthropic-sdk-typescript/commit/9f0a73d794fc110689ce1c67b68d0a68133adb8d))


### Documentation

* document customizing fetch ([#204](https://github.com/anthropics/anthropic-sdk-typescript/issues/204)) ([d2df724](https://github.com/anthropics/anthropic-sdk-typescript/commit/d2df7246ec244f2de73d359ffbff3f88acec781d))
* fix github links ([#200](https://github.com/anthropics/anthropic-sdk-typescript/issues/200)) ([4038acd](https://github.com/anthropics/anthropic-sdk-typescript/commit/4038acd91f4de7c3b20efe7f76523d1e6970f5d9))
* **readme:** mention version header ([#205](https://github.com/anthropics/anthropic-sdk-typescript/issues/205)) ([a8d8f07](https://github.com/anthropics/anthropic-sdk-typescript/commit/a8d8f07f9d4890195847b6ea86eb311e258e655f))

## 0.8.1 (2023-10-25)

Full Changelog: [v0.8.0...v0.8.1](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.8.0...v0.8.1)

### Bug Fixes

* typo in build script ([#197](https://github.com/anthropics/anthropic-sdk-typescript/issues/197)) ([212e990](https://github.com/anthropics/anthropic-sdk-typescript/commit/212e9903e9b72b3169f450d8ab11ebd384951dba))

## 0.8.0 (2023-10-24)

Full Changelog: [v0.7.0...v0.8.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.7.0...v0.8.0)

### Features

* **client:** adjust retry behavior to be exponential backoff ([#192](https://github.com/anthropics/anthropic-sdk-typescript/issues/192)) ([747afe2](https://github.com/anthropics/anthropic-sdk-typescript/commit/747afe2bdbbe3a5489e9b9bc6ed4fcf2a276e40b))

## 0.7.0 (2023-10-19)

Full Changelog: [v0.6.8...v0.7.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.6.8...v0.7.0)

### Features

* handle 204 No Content gracefully ([#190](https://github.com/anthropics/anthropic-sdk-typescript/issues/190)) ([c8a8bec](https://github.com/anthropics/anthropic-sdk-typescript/commit/c8a8becd127e5275333900c3bb76955605ae0f02))

## 0.6.8 (2023-10-17)

Full Changelog: [v0.6.7...v0.6.8](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.6.7...v0.6.8)

### Bug Fixes

* import web-streams-polyfill without overriding globals ([#186](https://github.com/anthropics/anthropic-sdk-typescript/issues/186)) ([e774e17](https://github.com/anthropics/anthropic-sdk-typescript/commit/e774e1774642668e080de5233aeaa33cf5f1b3ae))

## 0.6.7 (2023-10-16)

Full Changelog: [v0.6.6...v0.6.7](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.6.6...v0.6.7)

### Bug Fixes

* improve status code in error messages ([#183](https://github.com/anthropics/anthropic-sdk-typescript/issues/183)) ([7d3bbd4](https://github.com/anthropics/anthropic-sdk-typescript/commit/7d3bbd485c9628bb7c3fb5d1660934198981fcc7))


### Chores

* add case insensitive get header function ([#178](https://github.com/anthropics/anthropic-sdk-typescript/issues/178)) ([13c398d](https://github.com/anthropics/anthropic-sdk-typescript/commit/13c398dee3ff2eaa3b6046630eda9831580348f4))
* **internal:** add debug logs for stream responses ([#182](https://github.com/anthropics/anthropic-sdk-typescript/issues/182)) ([a1fa1b7](https://github.com/anthropics/anthropic-sdk-typescript/commit/a1fa1b7766248f3178cb55ac5342409a57c1dbb8))
* update comment ([#179](https://github.com/anthropics/anthropic-sdk-typescript/issues/179)) ([27a425e](https://github.com/anthropics/anthropic-sdk-typescript/commit/27a425ee64dcdc569b92ac27b501bca0dadf2dea))


### Documentation

* organisation -&gt; organization (UK to US English) ([#185](https://github.com/anthropics/anthropic-sdk-typescript/issues/185)) ([70257d4](https://github.com/anthropics/anthropic-sdk-typescript/commit/70257d43296f5b448b5649a34b67a3a3a26704ab))


### Refactors

* **streaming:** change Stream constructor signature ([#174](https://github.com/anthropics/anthropic-sdk-typescript/issues/174)) ([1951824](https://github.com/anthropics/anthropic-sdk-typescript/commit/195182432c41a2a8a4fc425788267e60f36f5820))
* **test:** refactor authentication tests ([#176](https://github.com/anthropics/anthropic-sdk-typescript/issues/176)) ([f59daad](https://github.com/anthropics/anthropic-sdk-typescript/commit/f59daad06cab4c5df3068ea7f71ecbb20d8af141))

## 0.6.6 (2023-10-11)

Full Changelog: [v0.6.5...v0.6.6](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.6.5...v0.6.6)

### Chores

* update README ([#173](https://github.com/anthropics/anthropic-sdk-typescript/issues/173)) ([5f50c1b](https://github.com/anthropics/anthropic-sdk-typescript/commit/5f50c1b2f160610c89f158a10d83029c356d925a))

## 0.6.5 (2023-10-11)

Full Changelog: [v0.6.4...v0.6.5](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.6.4...v0.6.5)

### Features

* **client:** handle retry-after with a date ([#162](https://github.com/anthropics/anthropic-sdk-typescript/issues/162)) ([31bd609](https://github.com/anthropics/anthropic-sdk-typescript/commit/31bd60905858a6532414665a1368ae9f5fd29370))
* **client:** retry on 408 Request Timeout ([#151](https://github.com/anthropics/anthropic-sdk-typescript/issues/151)) ([3523ffe](https://github.com/anthropics/anthropic-sdk-typescript/commit/3523ffe5647448d5a5960b1339c9a17374e85dd5))
* **client:** support importing node or web shims manually ([#157](https://github.com/anthropics/anthropic-sdk-typescript/issues/157)) ([c1237fe](https://github.com/anthropics/anthropic-sdk-typescript/commit/c1237feaea9ca2d244720f2f75e023450a78019f))
* **errors:** add status code to error message ([#155](https://github.com/anthropics/anthropic-sdk-typescript/issues/155)) ([76cf128](https://github.com/anthropics/anthropic-sdk-typescript/commit/76cf128b68f206038945ac4f54f6f50e8a6a2c1b))
* **package:** export a root error type ([#160](https://github.com/anthropics/anthropic-sdk-typescript/issues/160)) ([51d8d60](https://github.com/anthropics/anthropic-sdk-typescript/commit/51d8d60b72fbe99dcb4d5a9ec32abbcb21ba1460))


### Bug Fixes

* **client:** eliminate circular imports, which cause runtime errors in webpack dev bundles ([#170](https://github.com/anthropics/anthropic-sdk-typescript/issues/170)) ([4a86733](https://github.com/anthropics/anthropic-sdk-typescript/commit/4a86733b9d11349fca041683ac9d89685133557d))
* fix namespace exports regression ([#171](https://github.com/anthropics/anthropic-sdk-typescript/issues/171)) ([0689a91](https://github.com/anthropics/anthropic-sdk-typescript/commit/0689a9196619d968870b7fd2e1a0f037a1aee282))
* prevent ReferenceError, update compatibility to ES2020 and Node 18+ ([#169](https://github.com/anthropics/anthropic-sdk-typescript/issues/169)) ([9753314](https://github.com/anthropics/anthropic-sdk-typescript/commit/9753314b7e36a270bb4c29f2981c521ec9c17773))


### Chores

* **internal:** bump lock file ([#159](https://github.com/anthropics/anthropic-sdk-typescript/issues/159)) ([e6030fa](https://github.com/anthropics/anthropic-sdk-typescript/commit/e6030fa915f26569f9c48c478a5e6c01910a6557))
* **internal:** minor formatting improvement ([#168](https://github.com/anthropics/anthropic-sdk-typescript/issues/168)) ([6447608](https://github.com/anthropics/anthropic-sdk-typescript/commit/644760883802bc2769a916fa477f2c6491f018fd))
* **internal:** update lock file ([#161](https://github.com/anthropics/anthropic-sdk-typescript/issues/161)) ([370ce3c](https://github.com/anthropics/anthropic-sdk-typescript/commit/370ce3c34b87591071fefc8b53977078603b6ca4))
* **internal:** update lock file ([#163](https://github.com/anthropics/anthropic-sdk-typescript/issues/163)) ([4a37181](https://github.com/anthropics/anthropic-sdk-typescript/commit/4a37181e0ceada13e3ed61d6df7aa34492dc57a7))
* **internal:** update lock file ([#164](https://github.com/anthropics/anthropic-sdk-typescript/issues/164)) ([939c155](https://github.com/anthropics/anthropic-sdk-typescript/commit/939c155277e67c19f7b2ff956f7cf0d40d4671cd))


### Documentation

* **api.md:** add shared models ([#158](https://github.com/anthropics/anthropic-sdk-typescript/issues/158)) ([33e5518](https://github.com/anthropics/anthropic-sdk-typescript/commit/33e5518bdeca83bbbde0e144e444609f569f1477))
* declare Bun 1.0 officially supported ([#154](https://github.com/anthropics/anthropic-sdk-typescript/issues/154)) ([429d8f4](https://github.com/anthropics/anthropic-sdk-typescript/commit/429d8f44b113a91599f0ebb69128636da82a5050))
* **readme:** remove incorrect wording in opening ([#156](https://github.com/anthropics/anthropic-sdk-typescript/issues/156)) ([01973fe](https://github.com/anthropics/anthropic-sdk-typescript/commit/01973fe50b13ce2981656f8c13603975e7c43efd))

## 0.6.4 (2023-09-08)

Full Changelog: [v0.6.3...v0.6.4](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.6.3...v0.6.4)

### Features

* **package:** add Bun export map ([#139](https://github.com/anthropics/anthropic-sdk-typescript/issues/139)) ([ba3310d](https://github.com/anthropics/anthropic-sdk-typescript/commit/ba3310d903cd5fda91168266335f4e445e60cad4))


### Bug Fixes

* **client:** fix TS errors that appear when users Go to Source in VSCode ([#142](https://github.com/anthropics/anthropic-sdk-typescript/issues/142)) ([f7bfbea](https://github.com/anthropics/anthropic-sdk-typescript/commit/f7bfbeaa54d364201bbe5cddf3132875ae2a3ccf))
* **client:** handle case where the client is instantiated with a undefined baseURL ([#143](https://github.com/anthropics/anthropic-sdk-typescript/issues/143)) ([10e5203](https://github.com/anthropics/anthropic-sdk-typescript/commit/10e52034990d90dcdaf26672ea384545b88ddf35))
* **client:** use explicit file extensions in _shims imports ([#141](https://github.com/anthropics/anthropic-sdk-typescript/issues/141)) ([10fd687](https://github.com/anthropics/anthropic-sdk-typescript/commit/10fd68742a202c5c0a8b520db190c239dce9b676))
* fix module not found errors in Vercel edge ([#148](https://github.com/anthropics/anthropic-sdk-typescript/issues/148)) ([72e51a1](https://github.com/anthropics/anthropic-sdk-typescript/commit/72e51a170855281a8d099b00c6fb1e9ccb276212))
* **readme:** update link to api.md to use the correct branch ([#145](https://github.com/anthropics/anthropic-sdk-typescript/issues/145)) ([5db78ed](https://github.com/anthropics/anthropic-sdk-typescript/commit/5db78edec4826f86b2fc21ee3f470b49a4987029))


### Chores

* **internal:** export helper from core ([#147](https://github.com/anthropics/anthropic-sdk-typescript/issues/147)) ([7e79de1](https://github.com/anthropics/anthropic-sdk-typescript/commit/7e79de14edeab8110d740e996653e9f9cc2299a4))


### Documentation

* **readme:** add link to api.md ([#144](https://github.com/anthropics/anthropic-sdk-typescript/issues/144)) ([716c9f0](https://github.com/anthropics/anthropic-sdk-typescript/commit/716c9f0714c0e9c26cb6cdcb007457aff1284cf4))

## 0.6.3 (2023-08-28)

Full Changelog: [v0.6.2...v0.6.3](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.6.2...v0.6.3)

### Bug Fixes

* **types:** improve getNextPage() return type ([#137](https://github.com/anthropics/anthropic-sdk-typescript/issues/137)) ([713d603](https://github.com/anthropics/anthropic-sdk-typescript/commit/713d6032c2c3b3630314a9625a1672147ef19258))


### Chores

* **ci:** setup workflows to create releases and release PRs ([#135](https://github.com/anthropics/anthropic-sdk-typescript/issues/135)) ([56229d9](https://github.com/anthropics/anthropic-sdk-typescript/commit/56229d964733a8b00625dac4ff138b3ade7e4202))

## [0.6.2](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.6.1...v0.6.2) (2023-08-26)


### Bug Fixes

* **stream:** declare Stream.controller as public ([#132](https://github.com/anthropics/anthropic-sdk-typescript/issues/132)) ([ff33a89](https://github.com/anthropics/anthropic-sdk-typescript/commit/ff33a893747aa708133bab14e97fba34ec776303))


### Refactors

* remove unnecessary line in constructor ([#131](https://github.com/anthropics/anthropic-sdk-typescript/issues/131)) ([dcdf5e5](https://github.com/anthropics/anthropic-sdk-typescript/commit/dcdf5e5183e99ae91d170ca09cc6da5e5637783f))


### Chores

* **internal:** add helper method ([#133](https://github.com/anthropics/anthropic-sdk-typescript/issues/133)) ([4c6950a](https://github.com/anthropics/anthropic-sdk-typescript/commit/4c6950a489b818151127aa1a39c239e4fd58a06e))
* **internal:** export HeadersInit type shim ([#129](https://github.com/anthropics/anthropic-sdk-typescript/issues/129)) ([bcd51bd](https://github.com/anthropics/anthropic-sdk-typescript/commit/bcd51bd12ad0854baf28b59dcada871889032515))

## [0.6.1](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.6.0...v0.6.1) (2023-08-23)


### Features

* allow a default timeout to be set for clients ([#113](https://github.com/anthropics/anthropic-sdk-typescript/issues/113)) ([1c5b2e2](https://github.com/anthropics/anthropic-sdk-typescript/commit/1c5b2e29926100a6e4a6176f0943e2c98991175d))
* **client:** improve compatibility with Bun ([#119](https://github.com/anthropics/anthropic-sdk-typescript/issues/119)) ([fe4f5d5](https://github.com/anthropics/anthropic-sdk-typescript/commit/fe4f5d5e35e35cab2a62388eb595519e9c14635c))
* **docs:** add documentation to the client constructor ([#118](https://github.com/anthropics/anthropic-sdk-typescript/issues/118)) ([79303f9](https://github.com/anthropics/anthropic-sdk-typescript/commit/79303f9c46a8248abd05fedbedbbed6e735c046d))
* **types:** export RequestOptions type ([#127](https://github.com/anthropics/anthropic-sdk-typescript/issues/127)) ([9769751](https://github.com/anthropics/anthropic-sdk-typescript/commit/9769751b84853822e3e6596110ecb2c367f07438))
* **types:** remove footgun with streaming params ([#125](https://github.com/anthropics/anthropic-sdk-typescript/issues/125)) ([3ed67b6](https://github.com/anthropics/anthropic-sdk-typescript/commit/3ed67b670bae14bc586df224aa57dd4dfa6e71f5))


### Bug Fixes

* **client:** fix TypeError when a request gets retried ([#117](https://github.com/anthropics/anthropic-sdk-typescript/issues/117)) ([0ade979](https://github.com/anthropics/anthropic-sdk-typescript/commit/0ade979a322c07f9a8f5322407b38352fe99b3ce))
* **core:** fix navigator check for strange environments ([#124](https://github.com/anthropics/anthropic-sdk-typescript/issues/124)) ([c783604](https://github.com/anthropics/anthropic-sdk-typescript/commit/c7836040017d5ce35204c07be0b018e87e827fdb))
* **types:** add catch-all overload to streaming methods ([#123](https://github.com/anthropics/anthropic-sdk-typescript/issues/123)) ([7c229a2](https://github.com/anthropics/anthropic-sdk-typescript/commit/7c229a24e6751bad22acb8c544113713140120fd))


### Documentation

* **readme:** fix typo ([#121](https://github.com/anthropics/anthropic-sdk-typescript/issues/121)) ([c5dbc3f](https://github.com/anthropics/anthropic-sdk-typescript/commit/c5dbc3fe89c84a728b6a4d7a4f6eadb228ac5688))


### Chores

* assign default reviewers to release PRs ([#115](https://github.com/anthropics/anthropic-sdk-typescript/issues/115)) ([1df3965](https://github.com/anthropics/anthropic-sdk-typescript/commit/1df3965a10256d30f8ce2af8d9890a26522117a9))
* **internal:** add missing eslint-plugin-prettier ([#122](https://github.com/anthropics/anthropic-sdk-typescript/issues/122)) ([66bede0](https://github.com/anthropics/anthropic-sdk-typescript/commit/66bede0ae3ed7b5baa002bbb0c87b4156306f982))
* **internal:** fix error happening in CloudFlare pages ([#116](https://github.com/anthropics/anthropic-sdk-typescript/issues/116)) ([b0dc7b3](https://github.com/anthropics/anthropic-sdk-typescript/commit/b0dc7b3b14520ce1f66c2b9d6a0f5aae4028985b))
* **internal:** minor reformatting of code ([#120](https://github.com/anthropics/anthropic-sdk-typescript/issues/120)) ([4bcaf9e](https://github.com/anthropics/anthropic-sdk-typescript/commit/4bcaf9e30a312284cb22c2084e8242ad7d181ba8))

## [0.6.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.5.10...v0.6.0) (2023-08-12)


### Features

* **client:** add support for accessing the raw response object ([#105](https://github.com/anthropics/anthropic-sdk-typescript/issues/105)) ([c86b059](https://github.com/anthropics/anthropic-sdk-typescript/commit/c86b0593a630f3adafc5c329019ea7028b6a41cd))
* **client:** detect browser usage ([#101](https://github.com/anthropics/anthropic-sdk-typescript/issues/101)) ([f4cae3f](https://github.com/anthropics/anthropic-sdk-typescript/commit/f4cae3f63c2e65e087a7bf27dac1eeb8200e0a36))
* **types:** improve streaming params types ([#102](https://github.com/anthropics/anthropic-sdk-typescript/issues/102)) ([cdf808c](https://github.com/anthropics/anthropic-sdk-typescript/commit/cdf808ca2a18cd744a5d1840e5e2adb3015e8d1d))


### Documentation

* **readme:** minor updates ([#107](https://github.com/anthropics/anthropic-sdk-typescript/issues/107)) ([406fd97](https://github.com/anthropics/anthropic-sdk-typescript/commit/406fd97d4cee0dd363ad548c9a251f78091a70e3))
* **readme:** remove beta status + document versioning policy ([#100](https://github.com/anthropics/anthropic-sdk-typescript/issues/100)) ([e9ef3d2](https://github.com/anthropics/anthropic-sdk-typescript/commit/e9ef3d21a25e355d8bf94b7a941ad82ec5eafec8))


### Chores

* **docs:** remove trailing spaces ([#108](https://github.com/anthropics/anthropic-sdk-typescript/issues/108)) ([4ba2c6f](https://github.com/anthropics/anthropic-sdk-typescript/commit/4ba2c6f181521ed9a60ed45c35d2276129cd7a0b))
* **internal:** conditionally include bin during build output ([#109](https://github.com/anthropics/anthropic-sdk-typescript/issues/109)) ([58ac305](https://github.com/anthropics/anthropic-sdk-typescript/commit/58ac305d752d6b5c378f91b988ddfb97231c003c))
* **internal:** fix deno build ([#98](https://github.com/anthropics/anthropic-sdk-typescript/issues/98)) ([f011e04](https://github.com/anthropics/anthropic-sdk-typescript/commit/f011e041f2f9cabb12951013825c0f0a2a569053))
* **internal:** remove deno build ([#103](https://github.com/anthropics/anthropic-sdk-typescript/issues/103)) ([9af1527](https://github.com/anthropics/anthropic-sdk-typescript/commit/9af152707a9bcf3027afc64f027566be25da2eb9))


### Refactors

* **client:** remove Stream.toReadableStream() ([#110](https://github.com/anthropics/anthropic-sdk-typescript/issues/110)) ([c370412](https://github.com/anthropics/anthropic-sdk-typescript/commit/c37041285ed9cccf6d980a953e14ffd4006a8acc))

## [0.5.10](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.5.9...v0.5.10) (2023-08-01)


### Refactors

* create build for deno.land ([#93](https://github.com/anthropics/anthropic-sdk-typescript/issues/93)) ([2ea741a](https://github.com/anthropics/anthropic-sdk-typescript/commit/2ea741a4d4a3123b2eaafb87b73d7884c69ae23b))


### Documentation

* **readme:** add token counting reference ([#94](https://github.com/anthropics/anthropic-sdk-typescript/issues/94)) ([2c6a699](https://github.com/anthropics/anthropic-sdk-typescript/commit/2c6a699d499a3468fc4312a6b6c9493ffd1806a2))


### Chores

* **internal:** allow the build script to be run without yarn installed ([#91](https://github.com/anthropics/anthropic-sdk-typescript/issues/91)) ([9bd2b28](https://github.com/anthropics/anthropic-sdk-typescript/commit/9bd2b2871ca8a3b5f2466a904153d5c234094372))
* **internal:** fix deno build ([#96](https://github.com/anthropics/anthropic-sdk-typescript/issues/96)) ([3fdab4e](https://github.com/anthropics/anthropic-sdk-typescript/commit/3fdab4e33b4c8668d17b8cddabbb09a22adf4124))

## [0.5.9](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.5.8...v0.5.9) (2023-07-29)


### Bug Fixes

* **client:** handle undefined process in more places ([#87](https://github.com/anthropics/anthropic-sdk-typescript/issues/87)) ([d950c25](https://github.com/anthropics/anthropic-sdk-typescript/commit/d950c25469a6c6b0dd3cfecd282db078826366ba))
* **examples:** avoid swallowing errors in example scripts ([#82](https://github.com/anthropics/anthropic-sdk-typescript/issues/82)) ([b27cfe9](https://github.com/anthropics/anthropic-sdk-typescript/commit/b27cfe9323bce983bb49f57dece98f1d9e507034))
* fix undefined message in errors ([#86](https://github.com/anthropics/anthropic-sdk-typescript/issues/86)) ([5714a14](https://github.com/anthropics/anthropic-sdk-typescript/commit/5714a14d9af282a3d308b8694e6e03309d4b5642))


### Chores

* **internal:** minor refactoring of client instantiation ([#88](https://github.com/anthropics/anthropic-sdk-typescript/issues/88)) ([2c53e1c](https://github.com/anthropics/anthropic-sdk-typescript/commit/2c53e1ca28a444a48e5f1041d9eb9077608b3fc7))


### Refactors

* use destructuring arguments in client constructor and respect false values ([#89](https://github.com/anthropics/anthropic-sdk-typescript/issues/89)) ([8d4c686](https://github.com/anthropics/anthropic-sdk-typescript/commit/8d4c6860273bbd16027023700d521a5e48db76f7))

## [0.5.8](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.5.7...v0.5.8) (2023-07-22)


### Features

* **streaming:** make requests immediately throw an error if an aborted signal is passed in ([#79](https://github.com/anthropics/anthropic-sdk-typescript/issues/79)) ([5c86597](https://github.com/anthropics/anthropic-sdk-typescript/commit/5c865979a21d18db87df43a9bdb27b701815f4bb))

## [0.5.7](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.5.6...v0.5.7) (2023-07-19)


### Features

* add flexible enum to model param ([#73](https://github.com/anthropics/anthropic-sdk-typescript/issues/73)) ([a6bbcad](https://github.com/anthropics/anthropic-sdk-typescript/commit/a6bbcadb447060f3c2e60881d31d7b7fb7a50512))
* **client:** export ClientOptions interface ([#75](https://github.com/anthropics/anthropic-sdk-typescript/issues/75)) ([0315ce1](https://github.com/anthropics/anthropic-sdk-typescript/commit/0315ce170db463ad900384ab7e4f62885cb471a2))
* **deps:** remove unneeded qs dep ([#72](https://github.com/anthropics/anthropic-sdk-typescript/issues/72)) ([0aea5a6](https://github.com/anthropics/anthropic-sdk-typescript/commit/0aea5a6f4852f351ecbe9f46d6857a6fafc7e864))


### Bug Fixes

* **client:** fix errors with file uploads in the browser ([#76](https://github.com/anthropics/anthropic-sdk-typescript/issues/76)) ([ac48fa7](https://github.com/anthropics/anthropic-sdk-typescript/commit/ac48fa72bb764b2abed95f200bc658f65725e2b3))
* fix error in environments without `TextEncoder` ([#70](https://github.com/anthropics/anthropic-sdk-typescript/issues/70)) ([5b78e05](https://github.com/anthropics/anthropic-sdk-typescript/commit/5b78e0586fd351258ccc05c8ba89a2ba66681b0d))
* fix export map order ([#74](https://github.com/anthropics/anthropic-sdk-typescript/issues/74)) ([51e70cb](https://github.com/anthropics/anthropic-sdk-typescript/commit/51e70cb9b55128d4de1b0597fad475d0f4bc836c))

## [0.5.6](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.5.5...v0.5.6) (2023-07-15)


### Bug Fixes

* fix errors with "named" client export in CJS ([#67](https://github.com/anthropics/anthropic-sdk-typescript/issues/67)) ([08ef69c](https://github.com/anthropics/anthropic-sdk-typescript/commit/08ef69cca87bbdf82440d163611f45e04e894234))

## [0.5.5](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.5.4...v0.5.5) (2023-07-13)


### Features

* **client:** add support for passing a `signal` request option ([#55](https://github.com/anthropics/anthropic-sdk-typescript/issues/55)) ([09604e9](https://github.com/anthropics/anthropic-sdk-typescript/commit/09604e9990e13dd703f4bcfd0a241b8ec2ebbc71))


### Bug Fixes

* **streaming:** do not abort successfully completed streams ([#53](https://github.com/anthropics/anthropic-sdk-typescript/issues/53)) ([950dd49](https://github.com/anthropics/anthropic-sdk-typescript/commit/950dd4930429010d89ae31eef9ebb193be9517ad))


### Documentation

* **examples:** bump model to claude-2 in example scripts ([#57](https://github.com/anthropics/anthropic-sdk-typescript/issues/57)) ([f85c05d](https://github.com/anthropics/anthropic-sdk-typescript/commit/f85c05d49a7a9db1deb8eed9124934da763b721b))
* **readme:** improvements to formatting code snippets ([#58](https://github.com/anthropics/anthropic-sdk-typescript/issues/58)) ([67bae64](https://github.com/anthropics/anthropic-sdk-typescript/commit/67bae64d5388e7e71ea3a891b3579c072b743f38))


### Chores

* **internal:** add helper function for b64 ([#62](https://github.com/anthropics/anthropic-sdk-typescript/issues/62)) ([04e303c](https://github.com/anthropics/anthropic-sdk-typescript/commit/04e303c5cc7b14a862b81379d547b3dc6e908720))
* **internal:** let `toFile` helper accept promises to objects with name/type properties ([#63](https://github.com/anthropics/anthropic-sdk-typescript/issues/63)) ([93f9af2](https://github.com/anthropics/anthropic-sdk-typescript/commit/93f9af29a91cfced533d309d1816c58bc2efa355))
* **internal:** remove unneeded type var usage ([#59](https://github.com/anthropics/anthropic-sdk-typescript/issues/59)) ([42fc4a9](https://github.com/anthropics/anthropic-sdk-typescript/commit/42fc4a90cc267f077b26d2bafebe487a74cae067))

## [0.5.4](https://github.com/anthropics/anthropic-sdk-typescript/compare/v0.5.3...v0.5.4) (2023-07-11)


### Features

* **api:** reference claude-2 in examples ([#50](https://github.com/anthropics/anthropic-sdk-typescript/issues/50)) ([7c53ded](https://github.com/anthropics/anthropic-sdk-typescript/commit/7c53ded6b7f5f3efec0df295181f18469c37e09d))
* **client:** support passing a custom `fetch` function ([#46](https://github.com/anthropics/anthropic-sdk-typescript/issues/46)) ([7d54366](https://github.com/anthropics/anthropic-sdk-typescript/commit/7d54366fcefa0267e831a0cca4d10c9a146d9f6c))


### Bug Fixes

* **client:** properly handle multi-byte characters in Content-Length ([#47](https://github.com/anthropics/anthropic-sdk-typescript/issues/47)) ([8dfff26](https://github.com/anthropics/anthropic-sdk-typescript/commit/8dfff2691a3ebd5721462c055d8da638ac77e571))


### Refactors

* **streaming:** make response body streaming polyfill more spec-compliant ([#44](https://github.com/anthropics/anthropic-sdk-typescript/issues/44)) ([047d328](https://github.com/anthropics/anthropic-sdk-typescript/commit/047d328cb0968fb1926e41326d35b595ba3fb3bc))
