import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'scatter',
    name: 'Scatter',
    graphic: icon,
    initial: properties,
  })
}
