import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'mailgun',
    name: 'Mailgun Email',
    data: {
      domain: '',
      apiKey: '',
      email: '',
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
        http.post(
            url: "https://api.mailgun.net/v3/${data.domain}/messages",
            headers: {
              "Content-type": "application/json",
              "Authorization": "Basic api:\${apiKey}"
            },
            data: bytes(v: "{
              \\"from\\": \\"Username mailgun@${data.domain}\\",
              \\"to\\": \\"${data.email}\\",
              \\"subject\\": \\"InfluxDB Alert\\",
              \\"text\\": \\"\${ r._message }\\"
            }"))
    })
  )`,
    generateTestQuery: data => `
    apiKey = secrets.get(key: "{data.apiKey}")
    http.post(
        url: "https://api.mailgun.net/v3/${data.domain}/messages",
        headers: {
          "Content-type": "application/json",
          "Authorization": "Basic api:\${apiKey}"
        },
        data: bytes(v: "{
          \"from\": \"Username mailgun@${data.domain}\",
          \"to\": \"${data.email}\",
          \"subject\": \"InfluxDB Alert\",
          \"text\": \"${TEST_NOTIFICATION}\"
        }"))

    array.from(rows: [{value: 0}])
        |> yield(name: "ignore")`,
  })
}
