import icon from './icon'
import properties from './properties'
import view from './view'

export default register => {
  register({
    type: 'mosaic',
    name: 'Mosaic',
    graphic: icon,
    featureFlag: 'mosaicGraphType',
    component: view,
    initial: properties,
  })
}
