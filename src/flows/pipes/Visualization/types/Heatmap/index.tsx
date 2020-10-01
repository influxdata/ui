import icon from './icon'
import properties from './properties'
import HeatmapOptions from './HeatmapOptions'

export default register => {
  register({
    type: 'heatmap',
    name: 'Heatmap',
    graphic: icon,
    initial: properties,
    options: HeatmapOptions,
  })
}
