import icon from 'src/visualization/types/Map3d/icon'
import properties from 'src/visualization/types/Map3d/properties'
import view from 'src/visualization/types/Map3d/view'
import {GeoOptions as options} from 'src/visualization/types/Map3d/GeoOptions'
import {CLOUD} from 'src/shared/constants'

export default register => {
  register({
    type: 'geo3D',
    name: 'Geo3D',
    graphic: icon,
    initial: properties,
    component: view,
    options,
    // Maps are not supported on OSS
    disabled: !CLOUD,
  })
}
