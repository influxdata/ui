import View from './view'

export default register => {
  register({
    type: 'schedule',
    family: 'output',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--schedule',
    button: 'Schedule',
  })
}
