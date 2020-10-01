import icon from './icon'
import properties from './properties'
import ScatterOptions from './ScatterOptions'

export default register => {
  register({
    type: 'scatter',
    name: 'Scatter',
    graphic: icon,
    initial: properties,
    options: ScatterOptions,
  })
}
