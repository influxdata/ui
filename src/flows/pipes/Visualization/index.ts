import View from './view'
import './style.scss'
import {parse} from '@influxdata/flux-lsp-browser'
import {parseQuery} from 'src/shared/contexts/query'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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
    visual: (data, query) => {
      if (!query) {
        return ''
      }

      if (query.length === 0) {
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
