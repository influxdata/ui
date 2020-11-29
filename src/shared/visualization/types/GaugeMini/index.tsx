import icon from './icon'
import properties from './properties'
import GaugeOptions from './GaugeMiniOptions'

export default register => {
  register({
    type: 'gauge-mini',
    name: 'Gauge mini',
    graphic: icon,
    initial: properties,
    options: GaugeOptions,
  })
}
