import {IconFont} from '@influxdata/clockface'
import View from './view'
import {parse} from '@influxdata/flux-lsp-browser'
import {parseQuery} from 'src/shared/contexts/query'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'

export default register => {
  register({
    type: 'table',
    family: 'passThrough',
    priority: 3,
    component: View,
    button: 'Table',
    description: 'Display results in a table',
    icon: IconFont.Table,
    initial: {
      properties: SUPPORTED_VISUALIZATIONS['simple-table'].initial,
    },
    visual: (_data, query) => {
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

      return `${query} |> limit(n: 100)`
    },
  })
}
