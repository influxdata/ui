import View from './view'
import './style.scss'

import {TYPE_DEFINITIONS} from 'src/shared/visualization'

export default register => {
  register({
    type: 'visualization',
    family: 'passThrough',
    component: View,
    button: 'Visualization',
    initial: {
      panelVisibility: 'visible',
      panelHeight: 200,
      properties: TYPE_DEFINITIONS['xy'].initial,
    },
  })
}
