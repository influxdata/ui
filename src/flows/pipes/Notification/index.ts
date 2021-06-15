import View from './view'

export default register => {
  register({
    type: 'notification',
    family: 'output',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--notification',
    button: 'Notification',
    initial: {
      interval: '10m',
      offset: '0s',
      threshold: {
        type: 'greater',
        field: '_value',
        value: 0,
      },
      message:
        'Notification Rule: ${ r._notification_rule_name } triggered by check: ${ r._check_name }: ${ r._message }',
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
