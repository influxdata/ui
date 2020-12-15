import icon from './icon'
import properties from './properties'
import options from './options'

export default register => {
  register({
    type: 'gauge',
    name: 'Gauge',
    graphic: icon,
    initial: properties,
    options,
  })
}
