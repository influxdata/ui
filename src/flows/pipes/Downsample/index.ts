import {IconFont} from '@influxdata/clockface'
import View from './view'
import ReadOnly from './readOnly'
import './style.scss'

import {FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

export default register => {
  register({
    type: 'downsample',
    family: 'transform',
    component: View,
    readOnlyComponent: ReadOnly,
    featureFlag: 'flow-panel--downsample',
    button: 'Downsample',
    description: 'Bucket your data on a time window',
    icon: IconFont.Plus_New,
    initial: {
      functions: [{name: 'mean'}],
      aggregateWindow: {
        period: '',
        fillValues: false,
      },
    },
    source: (data, query) => {
      if (!data.aggregateWindow.period || !data.functions.length) {
        return query
      }

      return (
        query +
        data.functions
          .map(fn => {
            const spec = fn && FUNCTIONS.find(f => f.name === fn.name)

            if (!spec) {
              return ''
            }

            const period = data.aggregateWindow.period
            return spec.flux(
              period === 'auto' || !period ? 'v.windowPeriod' : period,
              data.aggregateWindow.fillValues
            )
          })
          .join('')
      )
    },
  })
}
