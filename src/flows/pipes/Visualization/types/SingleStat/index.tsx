import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'single-stat',
    name: 'Single Stat',
    graphic: icon,
    initial: properties,
  })
}
