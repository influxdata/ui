import icon from './icon'
import properties from './properties'
import options from './options'

export default register => {
  register({
    type: 'table',
    name: 'Table',
    graphic: icon,
    initial: properties,
    options: options,
  })
}
