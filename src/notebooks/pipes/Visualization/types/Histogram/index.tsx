import icon from './icon'
import properties from './properties'
import options from './options'

export default register => {
  register({
    type: 'histogram',
    name: 'Histogram',
    graphic: icon,
    initial: properties,
    options: options,
  })
}
