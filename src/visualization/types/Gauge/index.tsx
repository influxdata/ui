import icon from './icon'
import properties from './properties'
import {GaugeOptions} from './options'
import view from './view'

export default register => {
  register({
    type: 'gauge',
    name: 'Gauge',
    graphic: icon,
    initial: properties,
    component: view,
    options: GaugeOptions,
  })
}
