import { watchEffect } from 'vue';
import { createTitle, mergeHead } from '../../shared';
export function useUpdateHead(route, siteDataByRouteRef) {
    let isFirstUpdate = true;
    let managedHeadElements = [];
    const updateHeadTags = (newTags) => {
        if (import.meta.env.PROD && isFirstUpdate) {
            // in production, the initial meta tags are already pre-rendered so we
            // skip the first update.
            isFirstUpdate = false;
            newTags.forEach((tag) => {
                const headEl = createHeadElement(tag);
                for (const el of document.head.children) {
                    if (el.isEqualNode(headEl)) {
                        managedHeadElements.push(el);
                        return;
                    }
                }
            });
            return;
        }
        const newElements = newTags.map(createHeadElement);
        managedHeadElements.forEach((oldEl, oldIndex) => {
            const matchedIndex = newElements.findIndex((newEl) => newEl?.isEqualNode(oldEl ?? null));
            if (matchedIndex !== -1) {
                delete newElements[matchedIndex];
            }
            else {
                oldEl?.remove();
                delete managedHeadElements[oldIndex];
            }
        });
        newElements.forEach((el) => el && document.head.appendChild(el));
        managedHeadElements = [...managedHeadElements, ...newElements].filter(Boolean);
    };
    watchEffect(() => {
        const pageData = route.data;
        const siteData = siteDataByRouteRef.value;
        const pageDescription = pageData && pageData.description;
        const frontmatterHead = (pageData && pageData.frontmatter.head) || [];
        // update title and description
        const title = createTitle(siteData, pageData);
        if (title !== document.title) {
            document.title = title;
        }
        const description = pageDescription || siteData.description;
        let metaDescriptionElement = document.querySelector(`meta[name=description]`);
        if (metaDescriptionElement) {
            if (metaDescriptionElement.getAttribute('content') !== description) {
                metaDescriptionElement.setAttribute('content', description);
            }
        }
        else {
            createHeadElement(['meta', { name: 'description', content: description }]);
        }
        updateHeadTags(mergeHead(siteData.head, filterOutHeadDescription(frontmatterHead)));
    });
}
function createHeadElement([tag, attrs, innerHTML]) {
    const el = document.createElement(tag);
    for (const key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
    if (innerHTML) {
        el.innerHTML = innerHTML;
    }
    if (tag === 'script' && attrs.async == null) {
        // async is true by default for dynamically created scripts
        ;
        el.async = false;
    }
    return el;
}
function isMetaDescription(headConfig) {
    return (headConfig[0] === 'meta' &&
        headConfig[1] &&
        headConfig[1].name === 'description');
}
function filterOutHeadDescription(head) {
    return head.filter((h) => !isMetaDescription(h));
}
