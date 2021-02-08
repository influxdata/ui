import icon from './icon'
import properties from './properties'
import TableOptions from './TableOptions'

export default register => {
  register({
    type: 'table',
    name: 'Table',
    graphic: icon,
    initial: properties,
    options: TableOptions,
  })
}
