import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'slack',
    name: 'Slack',
    data: {
      url: 'https://hooks.slack.com/services/X/X/X',
      channel: '',
      color: '#34BB55',
    },
    component: View,
    readOnlyComponent: ReadOnly,
    generateImports: () => ['slack'].map(i => `import "${i}"`).join('\n'),
    generateTestImports: () =>
      ['array', 'slack'].map(i => `import "${i}"`).join('\n'),
    generateQuery: (data, measurement) => `task_data
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
  })
}
