import Slack from 'src/flows/pipes/Notification/Slack'
import PagerDuty from 'src/flows/pipes/Notification/PagerDuty'
import HTTP from 'src/flows/pipes/Notification/HTTP'

const TEST_NOTIFICATION = 'This is a test notification'

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
    generateTestImports: () =>
      ['array', 'slack'].map(i => `import "${i}"`).join('\n'),
    generateQuery: data => `task_data
	|> schema["fieldsAsCols"]()
	|> monitor["check"](
		data: check,
		messageFn: messageFn,
		crit: trigger,
	)
	|> monitor["notify"](
    data: notification,
    endpoint: slack["endpoint"](url: "${data.url}")(mapFn: (r) => ({
      channel: "${data.channel || ''}",
      text: "\${ r._message }",
      color: "${data.color || '#34BB55'}"
    }))
  )`,
    generateTestQuery: data => `
  slack.message(
    url: "${data.url}",
    channel: "${data.channel || ''}",
    text: "${TEST_NOTIFICATION}",
    color: "${data.color || '#34BB55'}"
  )

  array.from(rows: [{value: 0}])
	|> yield(name: "ignore")`,
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
    generateTestImports: () =>
      ['array', 'http', 'json'].map(i => `import "${i}"`).join('\n'),
    generateQuery: data => {
      const headers = [['"Content-Type"', '"application/json"']]

      if (data.auth === 'basic') {
        headers.push([
          'Authorization',
          `http.basicAuth(u:"${data.username}", p:"${data.password}")`,
        ])
      }

      if (data.auth === 'bearer') {
        headers.push(['Authorization', `"Bearer ${data.token}"`])
      }

      const _headers = headers
        .reduce((acc, curr) => {
          acc.push(`${curr[0]}: ${curr[1]}`)
          return acc
        }, [])
        .join(', ')

      const out = `task_data
	|> schema["fieldsAsCols"]()
	|> monitor["check"](
		data: check,
		messageFn: messageFn,
		crit: trigger,
	)
	|> monitor["notify"](data: notification, endpoint: http["endpoint"](url: "${data.url}")(mapFn: (r) => {
      body = {r with _version: 1}
      return {headers: {${_headers}}, data: json["encode"](v: body)}
  }))`
      return out
    },
    generateTestQuery: data => {
      const headers = [['"Content-Type"', '"application/json"']]

      if (data.auth === 'basic') {
        headers.push([
          'Authorization',
          `http.basicAuth(u:"${data.username}", p:"${data.password}")`,
        ])
      }

      if (data.auth === 'bearer') {
        headers.push(['Authorization', `"Bearer ${data.token}"`])
      }

      const _headers = headers
        .reduce((acc, curr) => {
          acc.push(`${curr[0]}: ${curr[1]}`)
          return acc
        }, [])
        .join(', ')

      return `http["endpoint"](url: "${data.url}")(mapFn: (r) => {
      return {headers: {${_headers}}, data: json["encode"](v: "${TEST_NOTIFICATION}")}
  })

  array.from(rows: [{value: 0}])
	|> yield(name: "ignore")`
    },
  },
  pagerduty: {
    name: 'Pager Duty',
    data: {
      url: '',
      key: '',
      level: 'warning',
    },
    view: PagerDuty,
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
        severity: pagerduty["severityFromLevel"](level: ${data.level}),
        eventAction: pagerduty["actionFromLevel"](level: ${data.level}),
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
  },
}
