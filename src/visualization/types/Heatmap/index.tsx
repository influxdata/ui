import icon from './icon'
import properties from './properties'
import options from './options'
import view from './view'

export default register => {
  register({
    type: 'heatmap',
    name: 'Heatmap',
    graphic: icon,
    initial: properties,
    component: view,
    options,
  })
}
