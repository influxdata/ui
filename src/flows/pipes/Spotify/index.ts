import {IconFont} from '@influxdata/clockface'
import View from './view'
import './style.scss'

export default register => {
  register({
    type: 'spotify',
    family: 'test',
    priority: -1,
    featureFlag: 'flow-panel--spotify',
    button: 'Music',
    description: 'Set the mood',
    icon: IconFont.GraphLine,
    component: View,
    initial: {
      uri: 'spotify:track:55A8N3HXzIecctUSvru3Ch',
    },
  })
}
