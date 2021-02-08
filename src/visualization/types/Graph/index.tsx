import icon from './icon'
import properties from './properties'
import options from './options'
import view from './view'

export default register => {
  register({
    type: 'xy',
    name: 'Graph',
    graphic: icon,
    component: view,
    initial: properties,
    options,
  })
}
