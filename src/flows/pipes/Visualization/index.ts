import View from './view'
import './style.scss'

import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'

export default register => {
  register({
    type: 'visualization',
    family: 'passThrough',
    component: View,
    button: 'Visualization',
    initial: {
      panelVisibility: 'visible',
      panelHeight: 200,
      properties: SUPPORTED_VISUALIZATIONS['xy'].initial,
    },
  })
}
