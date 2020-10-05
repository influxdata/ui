import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'map',
    name: 'Map',
    graphic: icon,
    disabled: true,
    initial: properties,
  })
}
