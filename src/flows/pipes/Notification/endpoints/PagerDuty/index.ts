import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'pagerduty',
    name: 'PagerDuty',
    data: {
      url: '',
      key: '',
      level: 'warning',
    },
    component: View,
    readOnlyComponent: ReadOnly,
    generateTestImports: () =>
      ['array', 'pagerduty', 'influxdata/influxdb/secrets']
        .map(i => `import "${i}"`)
        .join('\n'),
    generateImports: () =>
      ['pagerduty', 'influxdata/influxdb/secrets']
        .map(i => `import "${i}"`)
        .join('\n'),
    generateQuery: data => `task_data
	|> schema["fieldsAsCols"]()
  |> set(key: "_notebook_link", value: "${window.location.href}")  
  |> monitor["check"](
		data: check,
		messageFn: messageFn,
    crit: trigger,
	)
	|> monitor["notify"](data: notification, endpoint: pagerduty["endpoint"]()(mapFn: (r) => ({
        routingKey: "${data.key}",
        client: "influxdata",
        clientURL: "${data.url}",
        class: r._check_name,
        group: r["_source_measurement"],
        severity: pagerduty["severityFromLevel"](level: "${data.level}"),
        eventAction: pagerduty["actionFromLevel"](level: "${data.level}"),
        source: notification["_notification_rule_name"],
        summary: r["_message"],
        timestamp: time(v: r["_source_timestamp"]),
  })))`,
    generateTestQuery: data => `pagerduty["endpoint"]()(mapFn: (r) => ({
      routingKey: "${data.key}",
      client: "influxdata",
      clientURL: "${data.url}",
      class: r._check_name,
      group: r["_source_measurement"],
      severity: "critical",
      eventAction: "trigger",
      source: "Notebook Generated Test Notification",
      summary: "${TEST_NOTIFICATION}",
      timestamp: time(v: r["_source_timestamp"])
}))
  array.from(rows: [{value: 0}])
	|> yield(name: "ignore")
`,
  })
}
