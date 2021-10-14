import View from './view'
import {parse} from '@influxdata/flux'

import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'

export default register => {
  register({
    type: 'table',
    family: 'passThrough',
    priority: 3,
    component: View,
    button: 'Table',
    initial: {
      properties: SUPPORTED_VISUALIZATIONS['simple-table'].initial,
    },
    visual: (_data, query) => {
      if (!query) {
        return ''
      }

      try {
        const ast = parse(query)
        if (!ast.body.length) {
          return ''
        }
      } catch {
        return ''
      }

      return `${query} |> limit(n: 100)`
    },
  })
}
