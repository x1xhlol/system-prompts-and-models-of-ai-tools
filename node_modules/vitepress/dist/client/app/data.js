import siteData from '@siteData';
import { useDark, usePreferredDark } from '@vueuse/core';
import { computed, inject, readonly, ref, shallowRef, watch } from 'vue';
import { APPEARANCE_KEY, createTitle, inBrowser, resolveSiteDataByRoute } from '../shared';
export const dataSymbol = Symbol();
// site data is a singleton
export const siteDataRef = shallowRef((import.meta.env.PROD ? siteData : readonly(siteData)));
// hmr
if (import.meta.hot) {
    import.meta.hot.accept('/@siteData', (m) => {
        if (m) {
            siteDataRef.value = m.default;
        }
    });
}
// per-app data
export function initData(route) {
    const site = computed(() => resolveSiteDataByRoute(siteDataRef.value, route.data.relativePath));
    const appearance = site.value.appearance; // fine with reactivity being lost here, config change triggers a restart
    const isDark = appearance === 'force-dark'
        ? ref(true)
        : appearance === 'force-auto'
            ? usePreferredDark()
            : appearance
                ? useDark({
                    storageKey: APPEARANCE_KEY,
                    initialValue: () => (appearance === 'dark' ? 'dark' : 'auto'),
                    ...(typeof appearance === 'object' ? appearance : {})
                })
                : ref(false);
    const hashRef = ref(inBrowser ? location.hash : '');
    if (inBrowser) {
        window.addEventListener('hashchange', () => {
            hashRef.value = location.hash;
        });
    }
    watch(() => route.data, () => {
        hashRef.value = inBrowser ? location.hash : '';
    });
    return {
        site,
        theme: computed(() => site.value.themeConfig),
        page: computed(() => route.data),
        frontmatter: computed(() => route.data.frontmatter),
        params: computed(() => route.data.params),
        lang: computed(() => site.value.lang),
        dir: computed(() => route.data.frontmatter.dir || site.value.dir),
        localeIndex: computed(() => site.value.localeIndex || 'root'),
        title: computed(() => createTitle(site.value, route.data)),
        description: computed(() => route.data.description || site.value.description),
        isDark,
        hash: computed(() => hashRef.value)
    };
}
export function useData() {
    const data = inject(dataSymbol);
    if (!data) {
        throw new Error('vitepress data not properly injected in app');
    }
    return data;
}
