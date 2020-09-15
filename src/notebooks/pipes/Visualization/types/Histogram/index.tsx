import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'histogram',
    name: 'Histogram',
    graphic: icon,
    initial: properties,
  })
}
