import icon from 'src/visualization/types/Map/icon'
import properties from 'src/visualization/types/Map/properties'
import view from 'src/visualization/types/Map/view'
import {GeoOptions as options} from 'src/visualization/types/Map/GeoOptions'

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
