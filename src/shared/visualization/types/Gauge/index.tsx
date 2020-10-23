import icon from './icon'
import properties from './properties'
import GaugeOptions from './GaugeOptions'

export default register => {
  register({
    type: 'gauge',
    name: 'Gauge',
    graphic: icon,
    initial: properties,
    options: GaugeOptions,
  })
}
