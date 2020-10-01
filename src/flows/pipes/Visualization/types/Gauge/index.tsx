import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'gauge',
    name: 'Gauge',
    graphic: icon,
    initial: properties,
  })
}
