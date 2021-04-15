import Slack from 'src/flows/pipes/Notification/Slack'
import Bucket from 'src/flows/pipes/Notification/Bucket'
import PagerDuty from 'src/flows/pipes/Notification/PagerDuty'
import HTTP from 'src/flows/pipes/Notification/HTTP'

export const DEFAULT_ENDPOINTS = {
  slack: {
    name: 'Slack',
    data: {
      url: 'https://hooks.slack.com/services/X/X/X',
      channel: '',
      color: '#34BB55',
    },
    view: Slack,
    generateImports: () => ['slack'].map(i => `import "${i}"`).join('\n'),
    generateQuery: data => `task_data
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
      '#34BB55'}"})))`,
  },
  http: {
    name: 'HTTP Post',
    data: {
      auth: 'none',
      url: 'https://www.example.com/endpoint',
    },
    view: HTTP,
    generateImports: () =>
      ['http', 'json'].map(i => `import "${i}"`).join('\n'),
    generateQuery: data => `task_data
	|> schema["fieldsAsCols"]()
	|> monitor["check"](
		data: check,
		messageFn: messageFn,
		trigger: trigger,
	)
	|> monitor["notify"](data: notification, endpoint: http["endpoint"](url: ${data.endpointData.url})(mapFn: (r) => {
      body = {r with _version: 1}
      return {headers: {"Content-Type": "application/json"}, data: json["encode"](v: body)}
  }))`,
  },
  pagerduty: {
    name: 'Pager Duty',
    data: {
      url: '',
      key: '',
      level: 'warning',
    },
    view: PagerDuty,
    generateImports: () =>
      ['pagerduty', 'influxdata/influxdb/secrets']
        .map(i => `import "${i}"`)
        .join('\n'),
    generateQuery: data => `task_data
	|> schema["fieldsAsCols"]()
	|> monitor["check"](
		data: check,
		messageFn: messageFn,
		trigger: trigger,
	)
	|> monitor["notify"](data: notification, endpoint: pagerduty["endpoint"]()(mapFn: (r) => ({
        routingKey: "${data.endpointData.key},
        client: "influxdata",
        clientURL: "${data.endpointData.url}",
        class: r._check_name,
        group: r["_source_measurement"],
        severity: pagerduty["severityFromLevel"](level: ${data.endpointData.level}),
        eventAction: pagerduty["actionFromLevel"](level: ${data.endpointData.level}),
          source: notification["_notification_rule_name"],
          summary: r["_message"],
          timestamp: time(v: r["_source_timestamp"]),
  })))`,
  },
  bucket: {
    name: 'Write to Bucket',
    data: {
      bucket: null,
    },
    view: Bucket,
    generateImports: () => '',
    generateQuery: _data => ``,
  },
}
