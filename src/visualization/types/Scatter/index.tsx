import icon from './icon'
import properties from './properties'
import options from './options'
import view from './view'

export default register => {
  register({
    type: 'scatter',
    name: 'Scatter',
    graphic: icon,
    initial: properties,
    component: view,
    options,
  })
}
