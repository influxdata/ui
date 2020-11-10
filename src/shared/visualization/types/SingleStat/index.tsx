import icon from './icon'
import properties from './properties'
import SingleStatOptions from './SingleStatOptions'

export default register => {
  register({
    type: 'single-stat',
    name: 'Single Stat',
    graphic: icon,
    initial: properties,
    options: SingleStatOptions,
  })
}
