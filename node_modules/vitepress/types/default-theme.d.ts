import type MarkdownIt from 'markdown-it'
import type { Options as MiniSearchOptions } from 'minisearch'
import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { DocSearchProps } from './docsearch.js'
import type {
  LocalSearchTranslations,
  PageSplitSection
} from './local-search.js'
import type { Awaitable, MarkdownEnv, PageData } from './shared.js'

export namespace DefaultTheme {
  export interface Config {
    /**
     * The logo file of the site.
     *
     * @example '/logo.svg'
     */
    logo?: ThemeableImage

    /**
     * Overrides the link of the site logo.
     */
    logoLink?: string | { link?: string; rel?: string; target?: string }

    /**
     * Custom site title in navbar. If the value is undefined,
     * `config.title` will be used.
     */
    siteTitle?: string | false

    /**
     * Custom header levels of outline in the aside component.
     *
     * @default 2
     */
    outline?: Outline | Outline['level'] | false

    /**
     * @deprecated Use `outline.label` instead.
     *
     * @default 'On this page'
     */
    outlineTitle?: string

    /**
     * The nav items.
     */
    nav?: NavItem[]

    /**
     * The sidebar items.
     */
    sidebar?: Sidebar

    /**
     * Set to `false` to prevent rendering of aside container.
     * Set to `true` to render the aside to the right.
     * Set to `left` to render the aside to the left.
     *
     * @default true
     */
    aside?: boolean | 'left'

    /**
     * Info for the edit link. If it's undefined, the edit link feature will
     * be disabled.
     */
    editLink?: EditLink

    /**
     * @deprecated Use `lastUpdated.text` instead.
     *
     * Set custom last updated text.
     *
     * @default 'Last updated'
     */
    lastUpdatedText?: string

    lastUpdated?: LastUpdatedOptions

    /**
     * Set custom prev/next labels.
     */
    docFooter?: DocFooter

    /**
     * The social links to be displayed at the end of the nav bar. Perfect for
     * placing links to social services such as GitHub, Twitter, Facebook, etc.
     */
    socialLinks?: SocialLink[]

    /**
     * The footer configuration.
     */
    footer?: Footer

    /**
     * @default 'Appearance'
     */
    darkModeSwitchLabel?: string

    /**
     * @default 'Switch to light theme'
     */
    lightModeSwitchTitle?: string

    /**
     * @default 'Switch to dark theme'
     */
    darkModeSwitchTitle?: string

    /**
     * @default 'Menu'
     */
    sidebarMenuLabel?: string

    /**
     * @default 'Return to top'
     */
    returnToTopLabel?: string

    /**
     * Set custom `aria-label` for language menu button.
     *
     * @default 'Change language'
     */
    langMenuLabel?: string

    /**
     * @default 'Skip to content'
     */
    skipToContentLabel?: string

    search?:
      | { provider: 'local'; options?: LocalSearchOptions }
      | { provider: 'algolia'; options: AlgoliaSearchOptions }

    /**
     * @deprecated Use `search` instead.
     */
    algolia?: AlgoliaSearchOptions

    /**
     * The carbon ads options. Leave it undefined to disable the ads feature.
     */
    carbonAds?: CarbonAdsOptions

    /**
     * Changing locale when current url is `/foo` will redirect to `/locale/foo`.
     *
     * @default true
     */
    i18nRouting?: boolean

    /**
     * Show external link icon in Markdown links.
     *
     * @default false
     */
    externalLinkIcon?: boolean

    /**
     * Customize text of 404 page.
     */
    notFound?: NotFoundOptions
  }

  // nav -----------------------------------------------------------------------

  export type NavItem = NavItemComponent | NavItemWithLink | NavItemWithChildren

  export interface NavItemComponent {
    component: string
    props?: Record<string, any>
  }

  export interface NavItemWithLink {
    text: string
    link: string
    items?: never

    /**
     * `activeMatch` is expected to be a regex string. We can't use actual
     * RegExp object here because it isn't serializable
     */
    activeMatch?: string
    rel?: string
    target?: string
    noIcon?: boolean
  }

  export interface NavItemChildren {
    text?: string
    items: NavItemWithLink[]
  }

  export interface NavItemWithChildren {
    text?: string
    items: (NavItemComponent | NavItemChildren | NavItemWithLink)[]

    /**
     * `activeMatch` is expected to be a regex string. We can't use actual
     * RegExp object here because it isn't serializable
     */
    activeMatch?: string
  }

  // image ---------------------------------------------------------------------

  export type ThemeableImage =
    | string
    | { src: string; alt?: string; [prop: string]: any }
    | { light: string; dark: string; alt?: string; [prop: string]: any }

  export type FeatureIcon =
    | string
    | {
        src: string
        alt?: string
        width?: string
        height?: string
        wrap?: boolean
      }
    | {
        light: string
        dark: string
        alt?: string
        width?: string
        height?: string
        wrap?: boolean
      }

  // sidebar -------------------------------------------------------------------

  export type Sidebar = SidebarItem[] | SidebarMulti

  export interface SidebarMulti {
    [path: string]: SidebarItem[] | { items: SidebarItem[]; base: string }
  }

  export type SidebarItem = {
    /**
     * The text label of the item.
     */
    text?: string

    /**
     * The link of the item.
     */
    link?: string

    /**
     * The children of the item.
     */
    items?: SidebarItem[]

    /**
     * If not specified, group is not collapsible.
     *
     * If `true`, group is collapsible and collapsed by default
     *
     * If `false`, group is collapsible but expanded by default
     */
    collapsed?: boolean

    /**
     * Base path for the children items.
     */
    base?: string

    /**
     * Customize text that appears on the footer of previous/next page.
     */
    docFooterText?: string

    rel?: string
    target?: string
  }

  /**
   * ReturnType of `useSidebar`
   */
  export interface DocSidebar {
    isOpen: Ref<boolean>
    sidebar: ComputedRef<SidebarItem[]>
    sidebarGroups: ComputedRef<SidebarItem[]>
    hasSidebar: ComputedRef<boolean>
    hasAside: ComputedRef<boolean>
    leftAside: ComputedRef<boolean>
    isSidebarEnabled: ComputedRef<boolean>
    open: () => void
    close: () => void
    toggle: () => void
  }

  // edit link -----------------------------------------------------------------

  export interface EditLink {
    /**
     * Pattern for edit link.
     *
     * @example 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
     * @example ({ filePath }) => { ... }
     */
    pattern: string | ((payload: PageData) => string)

    /**
     * Custom text for edit link.
     *
     * @default 'Edit this page'
     */
    text?: string
  }

  // prev-next -----------------------------------------------------------------

  export interface DocFooter {
    /**
     * Custom label for previous page button. Can be set to `false` to disable.
     *
     * @default 'Previous page'
     */
    prev?: string | boolean

    /**
     * Custom label for next page button. Can be set to `false` to disable.
     *
     * @default 'Next page'
     */
    next?: string | boolean
  }

  // social link ---------------------------------------------------------------

  export interface SocialLink {
    icon: SocialLinkIcon
    link: string
    ariaLabel?: string
  }

  export type SocialLinkIcon = string | { svg: string }

  // footer --------------------------------------------------------------------

  export interface Footer {
    message?: string
    copyright?: string
  }

  // team ----------------------------------------------------------------------

  export interface TeamMember {
    avatar: string
    name: string
    title?: string
    org?: string
    orgLink?: string
    desc?: string
    links?: SocialLink[]
    sponsor?: string
    actionText?: string
  }

  // local nav -----------------------------------------------------------------

  /**
   * ReturnType of `useLocalNav`.
   */
  export interface DocLocalNav {
    /**
     * The outline headers of the current page.
     */
    headers: ShallowRef<any>

    /**
     * Whether the current page has a local nav. Local nav is shown when the
     * "outline" is present in the page. However, note that the actual
     * local nav visibility depends on the screen width as well.
     */
    hasLocalNav: ComputedRef<boolean>
  }

  // outline -------------------------------------------------------------------

  export interface Outline {
    level?: number | [number, number] | 'deep'
    label?: string
  }

  // local search --------------------------------------------------------------

  export interface LocalSearchOptions {
    /**
     * @default false
     * @deprecated Use `detailedView: false` instead.
     */
    disableDetailedView?: boolean

    /**
     * If `true`, the detailed view will be enabled by default.
     * If `false`, the detailed view will be disabled.
     * If `'auto'`, the detailed view will be disabled by default, but can be enabled by the user.
     *
     * @default 'auto'
     */
    detailedView?: boolean | 'auto'

    /**
     * @default false
     */
    disableQueryPersistence?: boolean

    translations?: LocalSearchTranslations
    locales?: Record<string, Partial<Omit<LocalSearchOptions, 'locales'>>>

    miniSearch?: {
      /**
       * @see https://lucaong.github.io/minisearch/types/MiniSearch.Options.html
       */
      options?: Pick<
        MiniSearchOptions,
        'extractField' | 'tokenize' | 'processTerm'
      >
      /**
       * @see https://lucaong.github.io/minisearch/types/MiniSearch.SearchOptions.html
       */
      searchOptions?: MiniSearchOptions['searchOptions']

      /**
       * Overrides the default regex based page splitter.
       * Supports async generator, making it possible to run in true parallel
       * (when used along with `node:child_process` or `worker_threads`)
       * ---
       * This should be especially useful for scalability reasons.
       * ---
       * @param {string} path - absolute path to the markdown source file
       * @param {string} html - document page rendered as html
       */
      _splitIntoSections?: (
        path: string,
        html: string
      ) =>
        | AsyncGenerator<PageSplitSection>
        | Generator<PageSplitSection>
        | Awaitable<PageSplitSection[]>
    }
    /**
     * Allows transformation of content before indexing (node only)
     * Return empty string to skip indexing
     */
    _render?: (
      src: string,
      env: MarkdownEnv,
      md: MarkdownIt
    ) => Awaitable<string>
  }

  // algolia -------------------------------------------------------------------

  /**
   * Algolia search options. Partially copied from
   * `@docsearch/react/dist/esm/DocSearch.d.ts`
   */
  export interface AlgoliaSearchOptions extends DocSearchProps {
    locales?: Record<string, Partial<DocSearchProps>>
  }

  // carbon ads ----------------------------------------------------------------

  export interface CarbonAdsOptions {
    code: string
    placement: string
  }

  // last updated --------------------------------------------------------------

  export interface LastUpdatedOptions {
    /**
     * Set custom last updated text.
     *
     * @default 'Last updated'
     */
    text?: string

    /**
     * Set options for last updated time formatting.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat#using_options
     *
     * @default
     * { dateStyle: 'short', timeStyle: 'short' }
     */
    formatOptions?: Intl.DateTimeFormatOptions & { forceLocale?: boolean }
  }

  // not found -----------------------------------------------------------------

  export interface NotFoundOptions {
    /**
     * Set custom not found message.
     *
     * @default 'PAGE NOT FOUND'
     */
    title?: string

    /**
     * Set custom not found description.
     *
     * @default "But if you don't change your direction, and if you keep looking, you may end up where you are heading."
     */
    quote?: string

    /**
     * Set aria label for home link.
     *
     * @default 'go to home'
     */
    linkLabel?: string

    /**
     * Set custom home link text.
     *
     * @default 'Take me home'
     */
    linkText?: string

    /**
     * @default '404'
     */
    code?: string
  }
}
