import icon from './icon'
import properties from './properties'
import options from './options'
import view from './view'

export default register => {
  register({
    type: 'gauge',
    name: 'Gauge',
    graphic: icon,
    initial: properties,
    component: view,
    options,
  })
}
