import icon from './icon'
import properties from './properties'

export default register => {
  register({
    type: 'mosaic',
    name: 'Mosaic',
    graphic: icon,
    featureFlag: 'mosaicGraphType',
    initial: properties,
  })
}
