import icon from './icon'
import properties from './properties'
import options from './options'

export default register => {
  register({
    type: 'heatmap',
    name: 'Heatmap',
    graphic: icon,
    initial: properties,
    options,
  })
}
