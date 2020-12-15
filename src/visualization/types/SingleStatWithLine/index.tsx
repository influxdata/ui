import icon from './icon'
import properties from './properties'
import options from './options'

export default register => {
  register({
    type: 'line-plus-single-stat',
    name: 'Graph + Single Stat',
    graphic: icon,
    initial: properties,
    options,
  })
}
