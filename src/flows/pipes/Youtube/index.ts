import View from './view'
import './style.scss'

export default register => {
  register({
    type: 'youtube',
    family: 'test',
    priority: -1,
    featureFlag: 'flow-panel--youtube',
    button: 'Youtube',
    description:
      'If a picture is worth a thousand words, imagine the power of a demo in your runbooks',
    component: View,
    initial: {
      uri: 'nBHkIWAJitg',
    },
  })
}
