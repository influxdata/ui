import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'heatmap',
    name: 'Heatmap',
    graphic: icon,
    initial: properties,
  })
}
