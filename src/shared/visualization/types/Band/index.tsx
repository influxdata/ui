import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'band',
    name: 'Band',
    graphic: icon,
    featureFlag: 'bandPlotType',
    initial: properties,
  })
}
