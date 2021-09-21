import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'schedule',
    family: 'output',
    priority: 1,
    component: View,
    readOnlyComponent: ReadOnly,
    featureFlag: 'flow-panel--schedule',
    button: 'Schedule',
  })
}
