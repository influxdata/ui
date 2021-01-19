import icon from './icon'
import properties from './properties'
import view from './view'
import options from './options'

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
