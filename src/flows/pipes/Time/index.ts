import View from './view'

export default register => {
  register({
    type: 'time',
    family: 'inputs',
    featureFlag: 'flow-panel--time',
    button: 'Time Range',
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
