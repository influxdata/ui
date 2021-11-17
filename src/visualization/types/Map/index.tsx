import icon from 'src/visualization/types/Map/icon'
import properties from 'src/visualization/types/Map/properties'
import view from 'src/visualization/types/Map/view'
import {GeoOptions as options} from 'src/visualization/types/Map/GeoOptions'
import {CLOUD} from 'src/shared/constants'

export default register => {
  register({
    type: 'geo',
    name: 'Map',
    graphic: icon,
    initial: properties,
    component: view,
    options,
    // Maps are not supported on OSS
    disabled: !CLOUD,
  })
}
