import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'line-plus-single-stat',
    name: 'Graph + Single Stat',
    graphic: icon,
    initial: properties,
  })
}
