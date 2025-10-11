import RawTheme from '@theme/index';
import { createApp as createClientApp, createSSRApp, defineComponent, h, onMounted, watchEffect } from 'vue';
import { ClientOnly } from './components/ClientOnly';
import { Content } from './components/Content';
import { useCodeGroups } from './composables/codeGroups';
import { useCopyCode } from './composables/copyCode';
import { useUpdateHead } from './composables/head';
import { usePrefetch } from './composables/preFetch';
import { dataSymbol, initData, siteDataRef, useData } from './data';
import { RouterSymbol, createRouter, scrollTo } from './router';
import { inBrowser, pathToFile } from './utils';
function resolveThemeExtends(theme) {
    if (theme.extends) {
        const base = resolveThemeExtends(theme.extends);
        return {
            ...base,
            ...theme,
            async enhanceApp(ctx) {
                if (base.enhanceApp)
                    await base.enhanceApp(ctx);
                if (theme.enhanceApp)
                    await theme.enhanceApp(ctx);
            }
        };
    }
    return theme;
}
const Theme = resolveThemeExtends(RawTheme);
const VitePressApp = defineComponent({
    name: 'VitePressApp',
    setup() {
        const { site, lang, dir } = useData();
        // change the language on the HTML element based on the current lang
        onMounted(() => {
            watchEffect(() => {
                document.documentElement.lang = lang.value;
                document.documentElement.dir = dir.value;
            });
        });
        if (import.meta.env.PROD && site.value.router.prefetchLinks) {
            // in prod mode, enable intersectionObserver based pre-fetch
            usePrefetch();
        }
        // setup global copy code handler
        useCopyCode();
        // setup global code groups handler
        useCodeGroups();
        if (Theme.setup)
            Theme.setup();
        return () => h(Theme.Layout);
    }
});
export async function createApp() {
    ;
    globalThis.__VITEPRESS__ = true;
    const router = newRouter();
    const app = newApp();
    app.provide(RouterSymbol, router);
    const data = initData(router.route);
    app.provide(dataSymbol, data);
    // install global components
    app.component('Content', Content);
    app.component('ClientOnly', ClientOnly);
    // expose $frontmatter & $params
    Object.defineProperties(app.config.globalProperties, {
        $frontmatter: {
            get() {
                return data.frontmatter.value;
            }
        },
        $params: {
            get() {
                return data.page.value.params;
            }
        }
    });
    if (Theme.enhanceApp) {
        await Theme.enhanceApp({
            app,
            router,
            siteData: siteDataRef
        });
    }
    // setup devtools in dev mode
    if (import.meta.env.DEV || __VUE_PROD_DEVTOOLS__) {
        import('./devtools.js').then(({ setupDevtools }) => setupDevtools(app, router, data));
    }
    return { app, router, data };
}
function newApp() {
    return import.meta.env.PROD
        ? createSSRApp(VitePressApp)
        : createClientApp(VitePressApp);
}
function newRouter() {
    let isInitialPageLoad = inBrowser;
    return createRouter((path) => {
        let pageFilePath = pathToFile(path);
        let pageModule = null;
        if (pageFilePath) {
            // use lean build if this is the initial page load
            if (isInitialPageLoad) {
                pageFilePath = pageFilePath.replace(/\.js$/, '.lean.js');
            }
            if (import.meta.env.DEV) {
                pageModule = import(/*@vite-ignore*/ pageFilePath).catch(() => {
                    // try with/without trailing slash
                    // in prod this is handled in src/client/app/utils.ts#pathToFile
                    const url = new URL(pageFilePath, 'http://a.com');
                    const path = (url.pathname.endsWith('/index.md')
                        ? url.pathname.slice(0, -9) + '.md'
                        : url.pathname.slice(0, -3) + '/index.md') +
                        url.search +
                        url.hash;
                    return import(/*@vite-ignore*/ path);
                });
            }
            else {
                pageModule = import(/*@vite-ignore*/ pageFilePath);
            }
        }
        if (inBrowser) {
            isInitialPageLoad = false;
        }
        return pageModule;
    }, Theme.NotFound);
}
if (inBrowser) {
    createApp().then(({ app, router, data }) => {
        // wait until page component is fetched before mounting
        router.go().then(() => {
            // dynamically update head tags
            useUpdateHead(router.route, data.site);
            app.mount('#app');
            // scroll to hash on new tab during dev
            if (import.meta.env.DEV && location.hash) {
                const target = document.getElementById(decodeURIComponent(location.hash).slice(1));
                if (target) {
                    scrollTo(target, location.hash);
                }
            }
        });
    });
}
