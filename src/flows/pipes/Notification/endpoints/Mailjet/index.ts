import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'mailjet',
    name: 'Mailjet Email',
    data: {
      url: 'https://api.mailjet.com/v3.1/send',
      apiKey: '',
      apiSecret: '',
      email: '',
      fromEmail: 'alerts@influxdata.com',
    },
    featureFlag: 'notebooksNewEndpoints',
    component: View,
    readOnlyComponent: ReadOnly,
    generateImports: () =>
      ['http', 'influxdata/influxdb/secrets']
        .map(i => `import "${i}"`)
        .join('\n'),
    generateTestImports: () =>
      ['array', 'http', 'influxdata/influxdb/secrets']
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
	|> monitor["notify"](
    data: notification,
    endpoint: ((r) => {
        apiKey = secrets.get(key: "${data.apiKey}")
        apiSecret = secrets.get(key: "${data.apiSecret}")
        http.post(
            url: "${data.url}",
            headers: {
              "Content-type": "application/json",
              "Authorization": "Basic \${apiKey}:\${apiSecret}"
            },
            data: bytes(v: "{
              \\"Messages\\": [{
                \\"From\\": {
                  \\"Email\\": \\"${data.fromEmail}\\"
                },
                \\"To\\": [{
                  \\"Email\\": \\"${data.email}\\"
                }],
                \\"Subject\\": \\"InfluxDB Alert\\",
                \\"TextPart\\": \\"\${ r._message }\\"
              }]
            }"))
    })
  )`,
    generateTestQuery: data => `
    apiKey = secrets.get(key: "${data.apiKey}")
    apiSecrets = secrets.get(key: "${data.apiSecret}")
    http.post(
      url: "${data.url}",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Basic \${apiKey}:\${apiSecret}"
      },
      data: bytes(v: "{
        \\"Messages\\": [{
          \\"From\\": {
            \\"Email\\": \\"${data.fromEmail}\\"
          },
          \\"To\\": [{
            \\"Email\\": \\"${data.email}\\"
          }],
          \\"Subject\\": \\"InfluxDB Alert\\",
          \\"TextPart\\": \\"${TEST_NOTIFICATION}\\"
        }]
      }"))

    array.from(rows: [{value: 0}])
        |> yield(name: "ignore")`,
  })
}
