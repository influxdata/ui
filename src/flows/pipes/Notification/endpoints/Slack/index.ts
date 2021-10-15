import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import Slack from './view'
import SlackReadOnly from './readOnly'

export default register => {
  register({
    type: 'slack',
    name: 'Slack',
    data: {
      url: 'https://hooks.slack.com/services/X/X/X',
      channel: '',
      color: '#34BB55',
    },
    component: Slack,
    readOnlyComponent: SlackReadOnly,
    generateImports: () => ['slack'].map(i => `import "${i}"`).join('\n'),
    generateTestImports: () =>
      ['array', 'slack'].map(i => `import "${i}"`).join('\n'),
    generateQuery: data => `task_data
	|> schema["fieldsAsCols"]()
      |> set(key: "_notebook_link", value: "${window.location.href}")
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
  })
}
