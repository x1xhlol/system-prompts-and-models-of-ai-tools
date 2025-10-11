import * as vue from 'vue';
import { Component, InjectionKey, Ref, App, AsyncComponentLoader } from 'vue';
import { PageData, Awaitable, SiteData } from '../../types/shared.js';
export { HeadConfig, Header, PageData, SiteData } from '../../types/shared.js';

declare const inBrowser: boolean;
/**
 * @internal
 */
declare function escapeHtml(str: string): string;

interface Route {
    path: string;
    data: PageData;
    component: Component | null;
}
interface Router {
    /**
     * Current route.
     */
    route: Route;
    /**
     * Navigate to a new URL.
     */
    go: (to?: string) => Promise<void>;
    /**
     * Called before the route changes. Return `false` to cancel the navigation.
     */
    onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>;
    /**
     * Called before the page component is loaded (after the history state is
     * updated). Return `false` to cancel the navigation.
     */
    onBeforePageLoad?: (to: string) => Awaitable<void | boolean>;
    /**
     * Called after the page component is loaded (before the page component is updated).
     */
    onAfterPageLoad?: (to: string) => Awaitable<void>;
    /**
     * Called after the route changes.
     */
    onAfterRouteChange?: (to: string) => Awaitable<void>;
    /**
     * @deprecated use `onAfterRouteChange` instead
     */
    onAfterRouteChanged?: (to: string) => Awaitable<void>;
}
declare function useRouter(): Router;
declare function useRoute(): Route;

declare const dataSymbol: InjectionKey<VitePressData>;
interface VitePressData<T = any> {
    /**
     * Site-level metadata
     */
    site: Ref<SiteData<T>>;
    /**
     * themeConfig from .vitepress/config.js
     */
    theme: Ref<T>;
    /**
     * Page-level metadata
     */
    page: Ref<PageData>;
    /**
     * page frontmatter data
     */
    frontmatter: Ref<PageData['frontmatter']>;
    /**
     * dynamic route params
     */
    params: Ref<PageData['params']>;
    title: Ref<string>;
    description: Ref<string>;
    lang: Ref<string>;
    dir: Ref<string>;
    localeIndex: Ref<string>;
    isDark: Ref<boolean>;
    /**
     * Current location hash
     */
    hash: Ref<string>;
}
declare function useData<T = any>(): VitePressData<T>;

interface EnhanceAppContext {
    app: App;
    router: Router;
    siteData: Ref<SiteData>;
}
interface Theme {
    Layout?: Component;
    enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>;
    extends?: Theme;
    /**
     * @deprecated can be replaced by wrapping layout component
     */
    setup?: () => void;
    /**
     * @deprecated Render not found page by checking `useData().page.value.isNotFound` in Layout instead.
     */
    NotFound?: Component;
}

/**
 * Append base to internal (non-relative) urls
 */
declare function withBase(path: string): string;
/**
 * Register callback that is called every time the markdown content is updated
 * in the DOM.
 */
declare function onContentUpdated(fn: () => any): void;
declare function defineClientComponent(loader: AsyncComponentLoader, args?: any[], cb?: () => Awaitable<void>): {
    setup(): () => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }> | null;
};
declare function getScrollOffset(): number;

declare const Content: vue.DefineComponent<vue.ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
}>> & Readonly<{}>, {
    as: string | Record<string, any>;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

export { Content, type EnhanceAppContext, type Route, type Router, type Theme, type VitePressData, escapeHtml as _escapeHtml, dataSymbol, defineClientComponent, getScrollOffset, inBrowser, onContentUpdated, useData, useRoute, useRouter, withBase };
