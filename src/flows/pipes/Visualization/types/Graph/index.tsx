import icon from './icon'
import properties from './properties'
import GraphOptions from './GraphOptions'

export default register => {
  register({
    type: 'xy',
    name: 'Graph',
    graphic: icon,
    initial: properties,
    options: GraphOptions,
  })
}
