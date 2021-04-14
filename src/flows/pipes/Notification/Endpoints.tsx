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
    generateImports: () => ['http'].map(i => `import "${i}"`).join('\n'),
    generateQuery: _data => ``,
  },
  pagerduty: {
    name: 'Pager Duty',
    data: {
      url: '',
      key: '',
    },
    view: PagerDuty,
    generateImports: () => ['pagerduty'].map(i => `import "${i}"`).join('\n'),
    generateQuery: _data => ``,
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
