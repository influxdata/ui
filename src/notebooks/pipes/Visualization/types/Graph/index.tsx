import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'xy',
    name: 'Graph',
    graphic: icon,
    initial: properties,
  })
}
