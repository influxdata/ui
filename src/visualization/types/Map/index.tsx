import icon from './icon'
import properties from './properties'
import {GeoOptions as options} from './GeoOptions'

import view from './view'

export default register => {
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
