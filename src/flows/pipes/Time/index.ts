import {IconFont} from '@influxdata/clockface'
import View from './view'

export default register => {
  register({
    type: 'time',
    family: 'context',
    featureFlag: 'flow-panel--time',
    button: 'Time Range',
    description: 'Run against any time range',
    icon: IconFont.Clock_New,
    component: View,
    initial: {
      start: '-1h',
      stop: 'now()',
    },
    scope: (data, prev) => {
      return {
        ...prev,
        vars: {
          ...(prev.vars || {}),
          timeRangeStart: data.start,
          timeRangeStop: data.stop,
        },
      }
    },
  })
}
