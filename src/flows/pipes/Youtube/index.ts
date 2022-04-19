import {IconFont} from '@influxdata/clockface'
import View from './view'
import './style.scss'

export default register => {
  register({
    type: 'youtube',
    family: 'test',
    priority: -1,
    featureFlag: 'flow-panel--youtube',
    button: 'Youtube',
    description: 'Embed informational videos',
    icon: IconFont.PlayOutline,
    component: View,
    initial: {
      uri: 'nBHkIWAJitg',
    },
  })
}
