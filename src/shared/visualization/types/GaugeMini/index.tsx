import icon from './icon'
import properties from './properties'
import GaugeMiniOptions from './GaugeMiniOptions'

export default register => {
  register({
    type: 'gauge-mini',
    name: 'Gauge mini',
    graphic: icon,
    featureFlag: 'gaugeMini',
    initial: properties,
    options: GaugeMiniOptions,
  })
}
