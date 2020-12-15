import icon from './icon'
import properties from './properties'
import options from './options'

export default register => {
  register({
    type: 'xy',
    name: 'Graph',
    graphic: icon,
    initial: properties,
    options,
  })
}
