import icon from './icon'
import properties from './properties'
import options from './options'

export default register => {
  register({
    type: 'scatter',
    name: 'Scatter',
    graphic: icon,
    initial: properties,
    options,
  })
}
