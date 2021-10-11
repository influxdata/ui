import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'sendgrid',
    name: 'SendGrid Email',
    data: {
      url: 'https://api.sendgrid.com/v3/mail/send',
      apiKey: '',
      email: '',
      fromEmail: 'alerts@influxdata.com',
    },
    featureFlag: 'notebooksEmail',
    component: View,
    readOnlyComponent: ReadOnly,
    generateImports: () => ['http'].map(i => `import "${i}"`).join('\n'),
    generateTestImports: () =>
      ['array', 'http'].map(i => `import "${i}"`).join('\n'),
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
    endpoint: ((r) => {
        http.post(
            url: "${data.url}",
            headers: {
              "Content-type": "application/json",
              "Authorization": "Bearer ${data.apiKey}"
            },
            data: bytes(v: "{
              \\"personalizations\\": [
                {
                  \\"to\\": [
                    {
                      \\"email\\": \\"${data.email}\\"
                    }
                  ]
                }
              ],
              \\"from\\": {
                \\"email\\": \\"${data.fromEmail} \\"
              },
              \\"subject\\": \\"InfluxDB Alert\\",
              \\"content\\": [
                {
                  \\"type\\": \\"text/plain\\",
                  \\"value\\": \\"\${ r._message }\\"
                }
              ]
            }"))
    })
  )`,
    generateTestQuery: data => `
    http.post(
      url: "${data.url}",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer ${data.apiKey}"
      },
      data: bytes(v: "{
        \\"personalizations\\": [
          {
            \\"to\\": [
              {
                \\"email\\": \\"${data.email}\\"
              }
            ]
          }
        ],
        \\"from\\": {
          \\"email\\": \\"${data.fromEmail} \\"
        },
        \\"subject\\": \\"InfluxDB Alert\\",
        \\"content\\": [
          {
            \\"type\\": \\"text/plain\\",
            \\"value\\": \\"${TEST_NOTIFICATION}\\"
          }
        ]
      }"))

    array.from(rows: [{value: 0}])
        |> yield(name: "ignore")`,
  })
}
