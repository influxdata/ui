import {IconFont} from '@influxdata/clockface'
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
    description: 'Display results in a graph',
    icon: IconFont.BarChart_New,
    initial: {
      properties: SUPPORTED_VISUALIZATIONS['xy'].initial,
    },
    visual: (data, query) => {
      if (!query) {
        return ''
      }

      try {
        const ast = isFlagEnabled('fastFlows')
          ? parseQuery(query)
          : parse(query)
        if (!ast.body.length) {
          return ''
        }
      } catch {
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
