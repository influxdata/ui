import icon from './icon'
import properties from './properties'
import HistogramOptions from './HistogramOptions'

export default register => {
  register({
    type: 'histogram',
    name: 'Histogram',
    graphic: icon,
    initial: properties,
    options: HistogramOptions,
  })
}
