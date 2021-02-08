import View from './view'
import './style.scss'

export default register => {
  register({
    type: 'youtube',
    family: 'test',
    priority: -1,
    featureFlag: 'flow-panel--youtube',
    button: 'Youtube',
    component: View,
    initial: {
      uri: 'nBHkIWAJitg',
    },
  })
}
