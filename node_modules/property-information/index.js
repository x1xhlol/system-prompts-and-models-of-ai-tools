// Note: types exposed from `index.d.ts`.
import {merge} from './lib/util/merge.js'
import {aria} from './lib/aria.js'
import {html as htmlBase} from './lib/html.js'
import {svg as svgBase} from './lib/svg.js'
import {xlink} from './lib/xlink.js'
import {xmlns} from './lib/xmlns.js'
import {xml} from './lib/xml.js'

export {hastToReact} from './lib/hast-to-react.js'

export const html = merge([aria, htmlBase, xlink, xmlns, xml], 'html')

export {find} from './lib/find.js'
export {normalize} from './lib/normalize.js'

export const svg = merge([aria, svgBase, xlink, xmlns, xml], 'svg')
