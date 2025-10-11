// exports in this file are exposed to themes and md files via 'vitepress'
// so the user can do `import { useRoute, useData } from 'vitepress'`
// composables
export { dataSymbol, useData } from './app/data';
export { useRoute, useRouter } from './app/router';
// utilities
export { _escapeHtml, defineClientComponent, getScrollOffset, inBrowser, onContentUpdated, withBase } from './app/utils';
// components
export { Content } from './app/components/Content';
