export const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;
export const APPEARANCE_KEY = 'vitepress-theme-appearance';
const HASH_RE = /#.*$/;
const HASH_OR_QUERY_RE = /[?#].*$/;
const INDEX_OR_EXT_RE = /(?:(^|\/)index)?\.(?:md|html)$/;
export const inBrowser = typeof document !== 'undefined';
export const notFoundPageData = {
    relativePath: '404.md',
    filePath: '',
    title: '404',
    description: 'Not Found',
    headers: [],
    frontmatter: { sidebar: false, layout: 'page' },
    lastUpdated: 0,
    isNotFound: true
};
export function isActive(currentPath, matchPath, asRegex = false) {
    if (matchPath === undefined) {
        return false;
    }
    currentPath = normalize(`/${currentPath}`);
    if (asRegex) {
        return new RegExp(matchPath).test(currentPath);
    }
    if (normalize(matchPath) !== currentPath) {
        return false;
    }
    const hashMatch = matchPath.match(HASH_RE);
    if (hashMatch) {
        return (inBrowser ? location.hash : '') === hashMatch[0];
    }
    return true;
}
export function normalize(path) {
    return decodeURI(path)
        .replace(HASH_OR_QUERY_RE, '')
        .replace(INDEX_OR_EXT_RE, '$1');
}
export function isExternal(path) {
    return EXTERNAL_URL_RE.test(path);
}
export function getLocaleForPath(siteData, relativePath) {
    return (Object.keys(siteData?.locales || {}).find((key) => key !== 'root' &&
        !isExternal(key) &&
        isActive(relativePath, `/${key}/`, true)) || 'root');
}
/**
 * this merges the locales data to the main data by the route
 */
export function resolveSiteDataByRoute(siteData, relativePath) {
    const localeIndex = getLocaleForPath(siteData, relativePath);
    return Object.assign({}, siteData, {
        localeIndex,
        lang: siteData.locales[localeIndex]?.lang ?? siteData.lang,
        dir: siteData.locales[localeIndex]?.dir ?? siteData.dir,
        title: siteData.locales[localeIndex]?.title ?? siteData.title,
        titleTemplate: siteData.locales[localeIndex]?.titleTemplate ?? siteData.titleTemplate,
        description: siteData.locales[localeIndex]?.description ?? siteData.description,
        head: mergeHead(siteData.head, siteData.locales[localeIndex]?.head ?? []),
        themeConfig: {
            ...siteData.themeConfig,
            ...siteData.locales[localeIndex]?.themeConfig
        }
    });
}
/**
 * Create the page title string based on config.
 */
export function createTitle(siteData, pageData) {
    const title = pageData.title || siteData.title;
    const template = pageData.titleTemplate ?? siteData.titleTemplate;
    if (typeof template === 'string' && template.includes(':title')) {
        return template.replace(/:title/g, title);
    }
    const templateString = createTitleTemplate(siteData.title, template);
    if (title === templateString.slice(3)) {
        return title;
    }
    return `${title}${templateString}`;
}
function createTitleTemplate(siteTitle, template) {
    if (template === false) {
        return '';
    }
    if (template === true || template === undefined) {
        return ` | ${siteTitle}`;
    }
    if (siteTitle === template) {
        return '';
    }
    return ` | ${template}`;
}
function hasTag(head, tag) {
    const [tagType, tagAttrs] = tag;
    if (tagType !== 'meta')
        return false;
    const keyAttr = Object.entries(tagAttrs)[0]; // First key
    if (keyAttr == null)
        return false;
    return head.some(([type, attrs]) => type === tagType && attrs[keyAttr[0]] === keyAttr[1]);
}
export function mergeHead(prev, curr) {
    return [...prev.filter((tagAttrs) => !hasTag(curr, tagAttrs)), ...curr];
}
// https://github.com/rollup/rollup/blob/fec513270c6ac350072425cc045db367656c623b/src/utils/sanitizeFileName.ts
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;
export function sanitizeFileName(name) {
    const match = DRIVE_LETTER_REGEX.exec(name);
    const driveLetter = match ? match[0] : '';
    return (driveLetter +
        name
            .slice(driveLetter.length)
            .replace(INVALID_CHAR_REGEX, '_')
            .replace(/(^|\/)_+(?=[^/]*$)/, '$1'));
}
export function slash(p) {
    return p.replace(/\\/g, '/');
}
const KNOWN_EXTENSIONS = new Set();
export function treatAsHtml(filename) {
    if (KNOWN_EXTENSIONS.size === 0) {
        const extraExts = (typeof process === 'object' && process.env?.VITE_EXTRA_EXTENSIONS) ||
            import.meta.env?.VITE_EXTRA_EXTENSIONS ||
            '';
        ('3g2,3gp,aac,ai,apng,au,avif,bin,bmp,cer,class,conf,crl,css,csv,dll,' +
            'doc,eps,epub,exe,gif,gz,ics,ief,jar,jpe,jpeg,jpg,js,json,jsonld,m4a,' +
            'man,mid,midi,mjs,mov,mp2,mp3,mp4,mpe,mpeg,mpg,mpp,oga,ogg,ogv,ogx,' +
            'opus,otf,p10,p7c,p7m,p7s,pdf,png,ps,qt,roff,rtf,rtx,ser,svg,t,tif,' +
            'tiff,tr,ts,tsv,ttf,txt,vtt,wav,weba,webm,webp,woff,woff2,xhtml,xml,' +
            'yaml,yml,zip' +
            (extraExts && typeof extraExts === 'string' ? ',' + extraExts : ''))
            .split(',')
            .forEach((ext) => KNOWN_EXTENSIONS.add(ext));
    }
    const ext = filename.split('.').pop();
    return ext == null || !KNOWN_EXTENSIONS.has(ext.toLowerCase());
}
// https://github.com/sindresorhus/escape-string-regexp/blob/ba9a4473850cb367936417e97f1f2191b7cc67dd/index.js
export function escapeRegExp(str) {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}
/**
 * @internal
 */
export function escapeHtml(str) {
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/&(?![\w#]+;)/g, '&amp;');
}
