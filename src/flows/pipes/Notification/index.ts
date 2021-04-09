import View, {DEFAULT_ENDPOINTS} from './view'
import {THRESHOLD_TYPES} from './Threshold'

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
    generateFlux: (data, _create, append, _withSideEffects) => {
      /*
        if (!withSideEffects) {
            append('__CURRENT_RESULT__')
            return
        }
       */

      data.panel = 'RANDOM_ALPHANUMERIC_CODE'

      const condition = THRESHOLD_TYPES[data.threshold.type].condition(data)
      const query = `
import "strings"
import "regexp"
import "influxdata/influxdb/monitor"
import "influxdata/influxdb/schema"
import "influxdata/influxdb/secrets"
import "experimental"
${(DEFAULT_ENDPOINTS[data.endpoint]?.imports || [])
  .map(i => `import "${i}"`)
  .join('\n')}

option task = {name: "Notebook Generated Task From Panel ${
        data.panel
      }", every: ${data.interval}, offset: ${data.offset}}
check = {
	_check_id: "${data.panel}",
	_check_name: "Notebook Generated Check",
	_type: "custom",
	tags: {},
}
notification = {
	_notification_rule_id: "${data.panel}",
	_notification_rule_name: "Notebook Generated Rule",
	_notification_endpoint_id: "${data.panel}",
	_notification_endpoint_name: "Notebook Generated Endpoint",
}

task_data = ${data.query}
trigger = ${condition}
messageFn = (r) => ("${data.message}")

task_data
	|> schema["fieldsAsCols"]()
	|> monitor["check"](
		data: check,
		messageFn: messageFn,
		trigger: trigger,
	)
	|> monitor["notify"](data: notification, endpoint: slack["endpoint"](url: ${
    data.endpointData.url
  })(mapFn: (r) => ({channel: "${data.endpoint.channel ||
        ''}", text: "\${ r._message }", color: "${data.endpoint.color ||
        '#34BB55'}"})))
            `

      console.log('thisone', query)
      append('__CURRENT_RESULT__')
    },
  })
}
