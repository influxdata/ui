import View from './view'
import './style.scss'

export default register => {
  register({
    type: 'queryBuilder',
    family: 'inputs',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--query-builder',
    button: 'Query Builder',
    initial: {
      buckets: [],
      tags: [
        {
          key: '_measurement',
          values: [],
          aggregateFunctionType: 'filter',
        },
      ],
      functions: [{name: 'mean'}],
      aggregateWindow: {
        period: 'auto',
        fillValues: false,
      },
    },
    generateFlux: (_pipe, _create, _append) => {
      return
    },
  })
}
