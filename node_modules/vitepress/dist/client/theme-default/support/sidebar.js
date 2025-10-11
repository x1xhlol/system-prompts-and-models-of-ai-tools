import { isActive } from '../../shared';
import { ensureStartingSlash } from './utils';
/**
 * Get the `Sidebar` from sidebar option. This method will ensure to get correct
 * sidebar config from `MultiSideBarConfig` with various path combinations such
 * as matching `guide/` and `/guide/`. If no matching config was found, it will
 * return empty array.
 */
export function getSidebar(_sidebar, path) {
    if (Array.isArray(_sidebar))
        return addBase(_sidebar);
    if (_sidebar == null)
        return [];
    path = ensureStartingSlash(path);
    const dir = Object.keys(_sidebar)
        .sort((a, b) => {
        return b.split('/').length - a.split('/').length;
    })
        .find((dir) => {
        // make sure the multi sidebar key starts with slash too
        return path.startsWith(ensureStartingSlash(dir));
    });
    const sidebar = dir ? _sidebar[dir] : [];
    return Array.isArray(sidebar)
        ? addBase(sidebar)
        : addBase(sidebar.items, sidebar.base);
}
/**
 * Get or generate sidebar group from the given sidebar items.
 */
export function getSidebarGroups(sidebar) {
    const groups = [];
    let lastGroupIndex = 0;
    for (const index in sidebar) {
        const item = sidebar[index];
        if (item.items) {
            lastGroupIndex = groups.push(item);
            continue;
        }
        if (!groups[lastGroupIndex]) {
            groups.push({ items: [] });
        }
        groups[lastGroupIndex].items.push(item);
    }
    return groups;
}
export function getFlatSideBarLinks(sidebar) {
    const links = [];
    function recursivelyExtractLinks(items) {
        for (const item of items) {
            if (item.text && item.link) {
                links.push({
                    text: item.text,
                    link: item.link,
                    docFooterText: item.docFooterText
                });
            }
            if (item.items) {
                recursivelyExtractLinks(item.items);
            }
        }
    }
    recursivelyExtractLinks(sidebar);
    return links;
}
/**
 * Check if the given sidebar item contains any active link.
 */
export function hasActiveLink(path, items) {
    if (Array.isArray(items)) {
        return items.some((item) => hasActiveLink(path, item));
    }
    return isActive(path, items.link)
        ? true
        : items.items
            ? hasActiveLink(path, items.items)
            : false;
}
function addBase(items, _base) {
    return [...items].map((_item) => {
        const item = { ..._item };
        const base = item.base || _base;
        if (base && item.link)
            item.link = base + item.link;
        if (item.items)
            item.items = addBase(item.items, base);
        return item;
    });
}
