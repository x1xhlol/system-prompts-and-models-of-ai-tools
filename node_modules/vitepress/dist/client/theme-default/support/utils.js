import { withBase } from 'vitepress';
import { isExternal, treatAsHtml } from '../../shared';
import { useData } from '../composables/data';
export function throttleAndDebounce(fn, delay) {
    let timeoutId;
    let called = false;
    return () => {
        if (timeoutId)
            clearTimeout(timeoutId);
        if (!called) {
            fn();
            (called = true) && setTimeout(() => (called = false), delay);
        }
        else
            timeoutId = setTimeout(fn, delay);
    };
}
export function ensureStartingSlash(path) {
    return path.startsWith('/') ? path : `/${path}`;
}
export function normalizeLink(url) {
    const { pathname, search, hash, protocol } = new URL(url, 'http://a.com');
    if (isExternal(url) ||
        url.startsWith('#') ||
        !protocol.startsWith('http') ||
        !treatAsHtml(pathname))
        return url;
    const { site } = useData();
    const normalizedPath = pathname.endsWith('/') || pathname.endsWith('.html')
        ? url
        : url.replace(/(?:(^\.+)\/)?.*$/, `$1${pathname.replace(/(\.md)?$/, site.value.cleanUrls ? '' : '.html')}${search}${hash}`);
    return withBase(normalizedPath);
}
