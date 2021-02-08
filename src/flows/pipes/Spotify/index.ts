import View from './view'
import './style.scss'

export default register => {
  register({
    type: 'spotify',
    family: 'test',
    priority: -1,
    featureFlag: 'flow-panel--spotify',
    button: 'Music',
    component: View,
    initial: {
      uri: 'spotify:track:55A8N3HXzIecctUSvru3Ch',
    },
  })
}
