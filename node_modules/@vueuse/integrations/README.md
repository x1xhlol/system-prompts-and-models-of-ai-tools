# @vueuse/integrations

[![NPM version](https://img.shields.io/npm/v/@vueuse/integrations?color=a1b858)](https://www.npmjs.com/package/@vueuse/integrations)

> This is an add-on of [VueUse](https://github.com/vueuse/vueuse), providing integration wrappers for utility libraries.

## Install

```bash
npm i @vueuse/integrations
```

## Functions

<!--GENERATED LIST, DO NOT MODIFY MANUALLY-->
<!--FUNCTIONS_LIST_STARTS-->

- [`useAsyncValidator`](https://vueuse.org/integrations/useAsyncValidator/) — wrapper for [`async-validator`](https://github.com/yiminghe/async-validator)
- [`useAxios`](https://vueuse.org/integrations/useAxios/) — wrapper for [`axios`](https://github.com/axios/axios)
- [`useChangeCase`](https://vueuse.org/integrations/useChangeCase/) — reactive wrapper for [`change-case`](https://github.com/blakeembrey/change-case)
- [`useCookies`](https://vueuse.org/integrations/useCookies/) — wrapper for [`universal-cookie`](https://www.npmjs.com/package/universal-cookie)
- [`useDrauu`](https://vueuse.org/integrations/useDrauu/) — reactive instance for [drauu](https://github.com/antfu/drauu)
- [`useFocusTrap`](https://vueuse.org/integrations/useFocusTrap/) — reactive wrapper for [`focus-trap`](https://github.com/focus-trap/focus-trap)
- [`useFuse`](https://vueuse.org/integrations/useFuse/) — easily implement fuzzy search using a composable with [Fuse.js](https://github.com/krisk/fuse)
- [`useIDBKeyval`](https://vueuse.org/integrations/useIDBKeyval/) — wrapper for [`idb-keyval`](https://www.npmjs.com/package/idb-keyval)
- [`useJwt`](https://vueuse.org/integrations/useJwt/) — wrapper for [`jwt-decode`](https://github.com/auth0/jwt-decode)
- [`useNProgress`](https://vueuse.org/integrations/useNProgress/) — reactive wrapper for [`nprogress`](https://github.com/rstacruz/nprogress)
- [`useQRCode`](https://vueuse.org/integrations/useQRCode/) — wrapper for [`qrcode`](https://github.com/soldair/node-qrcode)
- [`useSortable`](https://vueuse.org/integrations/useSortable/) — wrapper for [`sortable`](https://github.com/SortableJS/Sortable)

<!--FUNCTIONS_LIST_ENDS-->

## Tree-shaking

For better tree-shaking result, import functions from submodules, for example:

```ts
// Don't
import { useAxios } from '@vueuse/integrations'

import { useAxios } from '@vueuse/integrations/useAxios'
```

## License

[MIT License](https://github.com/vueuse/vueuse/blob/master/LICENSE) © 2019-PRESENT [Anthony Fu](https://github.com/antfu)
