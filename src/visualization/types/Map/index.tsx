import icon from './icon'
import {CLOUD} from 'src/shared/constants'

let properties = null
let options = null
let view = null

if (CLOUD) {
  properties = require('./properties')
  view = require('./view')
  options = require('./GeoOptions').GeoOptions
}

export default register => {
  if (!CLOUD) {
    return
  }
  register({
    type: 'geo',
    name: 'Map',
    graphic: icon,
    featureFlag: 'mapGeo',
    initial: properties,
    component: view,
    options,
  })
}
