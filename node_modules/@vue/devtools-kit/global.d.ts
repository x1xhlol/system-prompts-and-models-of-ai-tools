import type { DevToolsHook, RouterInfo } from './src/types'

/* eslint-disable vars-on-top, no-var */
declare global {
  var __VUE_DEVTOOLS_GLOBAL_HOOK__: DevToolsHook
  var __VUE_DEVTOOLS_NEXT_APP_RECORD_INFO__: {
    id: number
    appIds: Set<string>
  }
  var __VUE_DEVTOOLS_ROUTER_INFO__: RouterInfo
  var __VUE_DEVTOOLS_ENV__: {
    vitePluginDetected: boolean
  }
  var __VUE_DEVTOOLS_COMPONENT_INSPECTOR_ENABLED__: boolean
  var __VUE_DEVTOOLS_VITE_PLUGIN_DETECTED__: boolean
  var __VUE_DEVTOOLS_VITE_PLUGIN_CLIENT_URL__: string
  var __VUE_DEVTOOLS_BROWSER_EXTENSION_DETECTED__: boolean
}

export { }
