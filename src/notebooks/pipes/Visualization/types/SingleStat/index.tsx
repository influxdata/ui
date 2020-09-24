import icon from './icon'
import properties from './properties'
import options from './options'

export default register => {
  register({
    type: 'single-stat',
    name: 'Single Stat',
    graphic: icon,
    initial: properties,
    options: options
  })
}
