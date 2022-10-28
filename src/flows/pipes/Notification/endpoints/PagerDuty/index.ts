import {EndpointTypeRegistration} from 'src/types'
import {PagerDutyReadOnly} from './readOnly'
import {PagerDuty} from './view'
import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'

export class Endpoint implements EndpointTypeRegistration {
  type = 'pagerduty'
  name = 'PagerDuty'
  data = {
    url: '',
    key: '',
    level: 'warning',
  }
  component = PagerDuty
  readOnlyComponent = PagerDutyReadOnly
  generateTestImports() {
    return ['array', 'pagerduty', 'influxdata/influxdb/secrets']
      .map(i => `import "${i}"`)
      .join('\n')
  }
  generateImports() {
    return ['pagerduty', 'influxdata/influxdb/secrets']
      .map(i => `import "${i}"`)
      .join('\n')
  }
  generateQuery(data, measurement) {
    return `task_data
|> schema["fieldsAsCols"]()
|> set(key: "_notebook_link", value: "${window.location.href}")
|> filter(fn: ${measurement})
|> monitor["check"](
  data: check,
  messageFn: messageFn,
  crit: trigger,
)
|> filter(fn: trigger)
|> keep(columns: ["_value", "_time", "_measurement"])
|> limit(n: 1, offset: 0)
|> monitor["notify"](data: notification, endpoint: pagerduty.endpoint()(mapFn: (r) => ({ r with
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
})))`
  }
  generateTestQuery(data) {
    return `pagerduty.sendEvent(
    pagerdutyURL: "https://events.pagerduty.com/v2/enqueue",
    routingKey: "${data.key}",
    client: "influxdata",
    clientURL: "${data.url}",
    dedupKey: "${new Date().toISOString()}",
    class: "check_name",
    group: "test_measurement",
    severity: "critical",
    eventAction: "trigger",
    source: "Notebook Generated Test Notification",
    component: "example-component",
    summary: "${TEST_NOTIFICATION}",
    timestamp: "${new Date().toISOString()}",
    customDetails: {}
  )
  array.from(rows: [{value: 0}])
    |> yield(name: "ignore")
  `
  }
}
