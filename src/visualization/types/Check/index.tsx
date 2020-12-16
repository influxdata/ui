import icon from './icon'
import properties from './properties'
import view from './view'

export default register => {
  register({
    type: 'check',
    name: 'Check',
    disabled: true,
    graphic: icon,
    component: view,
    initial: properties,
  })
}
