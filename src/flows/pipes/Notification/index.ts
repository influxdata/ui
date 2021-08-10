import View from './view'

export default register => {
  register({
    type: 'notification',
    family: 'output',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--notification',
    button: 'Alert',
    initial: {
      interval: '10m',
      offset: '0s',
      threshold: {
        type: 'greater',
        field: '_value',
        value: 0,
      },
      message:
        '${strings.title(v: r._type)} for ${r._source_measurement} triggered at ${time(v: r._source_timestamp)}!',
      endpoint: 'slack',
      endpointData: {
        url: 'https://hooks.slack.com/services/X/X/X',
      },
    },
    generateFlux: (_pipe, _create, append) => {
      append('__CURRENT_RESULT__')
    },
  })
}
