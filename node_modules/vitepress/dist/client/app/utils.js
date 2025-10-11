import { h, onMounted, onUnmounted, shallowRef } from 'vue';
import { EXTERNAL_URL_RE, inBrowser, sanitizeFileName } from '../shared';
import { siteDataRef } from './data';
export { escapeHtml as _escapeHtml, inBrowser } from '../shared';
/**
 * Join two paths by resolving the slash collision.
 */
export function joinPath(base, path) {
    return `${base}${path}`.replace(/\/+/g, '/');
}
/**
 * Append base to internal (non-relative) urls
 */
export function withBase(path) {
    return EXTERNAL_URL_RE.test(path) || !path.startsWith('/')
        ? path
        : joinPath(siteDataRef.value.base, path);
}
/**
 * Converts a url path to the corresponding js chunk filename.
 */
export function pathToFile(path) {
    let pagePath = path.replace(/\.html$/, '');
    pagePath = decodeURIComponent(pagePath);
    pagePath = pagePath.replace(/\/$/, '/index'); // /foo/ -> /foo/index
    if (import.meta.env.DEV) {
        // always force re-fetch content in dev
        pagePath += `.md?t=${Date.now()}`;
    }
    else {
        // in production, each .md file is built into a .md.js file following
        // the path conversion scheme.
        // /foo/bar.html -> ./foo_bar.md
        if (inBrowser) {
            const base = import.meta.env.BASE_URL;
            pagePath =
                sanitizeFileName(pagePath.slice(base.length).replace(/\//g, '_') || 'index') + '.md';
            // client production build needs to account for page hash, which is
            // injected directly in the page's html
            let pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
            if (!pageHash) {
                pagePath = pagePath.endsWith('_index.md')
                    ? pagePath.slice(0, -9) + '.md'
                    : pagePath.slice(0, -3) + '_index.md';
                pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
            }
            if (!pageHash)
                return null;
            pagePath = `${base}${__ASSETS_DIR__}/${pagePath}.${pageHash}.js`;
        }
        else {
            // ssr build uses much simpler name mapping
            pagePath = `./${sanitizeFileName(pagePath.slice(1).replace(/\//g, '_'))}.md.js`;
        }
    }
    return pagePath;
}
export let contentUpdatedCallbacks = [];
/**
 * Register callback that is called every time the markdown content is updated
 * in the DOM.
 */
export function onContentUpdated(fn) {
    contentUpdatedCallbacks.push(fn);
    onUnmounted(() => {
        contentUpdatedCallbacks = contentUpdatedCallbacks.filter((f) => f !== fn);
    });
}
export function defineClientComponent(loader, args, cb) {
    return {
        setup() {
            const comp = shallowRef();
            onMounted(async () => {
                let res = await loader();
                // interop module default
                if (res && (res.__esModule || res[Symbol.toStringTag] === 'Module')) {
                    res = res.default;
                }
                comp.value = res;
                await cb?.();
            });
            return () => (comp.value ? h(comp.value, ...(args ?? [])) : null);
        }
    };
}
export function getScrollOffset() {
    let scrollOffset = siteDataRef.value.scrollOffset;
    let offset = 0;
    let padding = 24;
    if (typeof scrollOffset === 'object' && 'padding' in scrollOffset) {
        padding = scrollOffset.padding;
        scrollOffset = scrollOffset.selector;
    }
    if (typeof scrollOffset === 'number') {
        offset = scrollOffset;
    }
    else if (typeof scrollOffset === 'string') {
        offset = tryOffsetSelector(scrollOffset, padding);
    }
    else if (Array.isArray(scrollOffset)) {
        for (const selector of scrollOffset) {
            const res = tryOffsetSelector(selector, padding);
            if (res) {
                offset = res;
                break;
            }
        }
    }
    return offset;
}
function tryOffsetSelector(selector, padding) {
    const el = document.querySelector(selector);
    if (!el)
        return 0;
    const bot = el.getBoundingClientRect().bottom;
    if (bot < 0)
        return 0;
    return bot + padding;
}
