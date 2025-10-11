import {create} from './util/create.js'
import {caseInsensitiveTransform} from './util/case-insensitive-transform.js'

export const xmlns = create({
  attributes: {xmlnsxlink: 'xmlns:xlink'},
  properties: {xmlnsXLink: null, xmlns: null},
  space: 'xmlns',
  transform: caseInsensitiveTransform
})
