import View from './view'
import './style.scss'

import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'

export default register => {
  register({
    type: 'visualization',
    family: 'passThrough',
    component: View,
    button: 'Graph',
    initial: {
      properties: SUPPORTED_VISUALIZATIONS['xy'].initial,
    },
    visual: (data, query: String) => {
      if (!query) {
        return ''
      }

      if (data.properties.type === 'simple-table') {
        return `${query} |> limit(n: 100)`
      }

      if (
        data.properties.type === 'single-stat' ||
        data.properties.type === 'gauge'
      ) {
        return `${query} |> last()`
      }

      return query
    },
  })
}
