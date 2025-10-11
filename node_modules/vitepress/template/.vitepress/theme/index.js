// https://vitepress.dev/guide/custom-theme
<% if (!defaultTheme) { %>import Layout from './Layout.vue'<% if (useTs) { %>
import type { Theme } from 'vitepress'<% } %>
import './style.css'

<% if (!useTs) { %>/** @type {import('vitepress').Theme} */
<% } %>export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}<% if (useTs) { %> satisfies Theme<% } %>
<% } else { %>import { h } from 'vue'<% if (useTs) { %>
import type { Theme } from 'vitepress'<% } %>
import DefaultTheme from 'vitepress/theme'
import './style.css'

<% if (!useTs) { %>/** @type {import('vitepress').Theme} */
<% } %>export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}<% if (useTs) { %> satisfies Theme<% } %><% } %>
