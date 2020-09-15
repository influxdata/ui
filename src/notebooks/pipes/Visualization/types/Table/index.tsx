import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'table',
    name: 'Table',
    graphic: icon,
    initial: properties,
  })
}
