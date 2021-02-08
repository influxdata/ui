import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'geo',
    name: 'Map',
    graphic: icon,
    featureFlag: 'mapGeo',
    initial: properties,
  })
}
