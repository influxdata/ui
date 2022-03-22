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
    generateQuery: (data, measurement) => {
      const subject = encodeURIComponent('InfluxDB Alert')
      const fromEmail = `mailgun@${data.domain}`

      return `apiKey = secrets.get(key: "${data.apiKey}")
auth = http.basicAuth(u: "api", p: "\${apiKey}")

task_data
	|> schema["fieldsAsCols"]()
      |> set(key: "_notebook_link", value: "${window.location.href}")
  |> filter(fn: ${measurement})
	|> monitor["check"](
		data: check,
		messageFn: messageFn,
		crit: trigger,
	)
  |> filter(fn: trigger)
	|> monitor["notify"](
    data: notification,
    endpoint: http.endpoint(url: "https://api.mailgun.net/v3/${data.domain}/messages")(
      mapFn: (r) => {
        data = strings.joinStr(arr: [
            "from=${fromEmail}",
            "to=${data.email}",
            "subject=${subject}",
            "text=\${r._message}"
          ], v: "&"
        )
        return {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "\${auth}"
          },
          data: bytes(v: data)
        }
      })
    )`
    },
    generateTestQuery: data => {
      const subject = encodeURIComponent('InfluxDB Alert')
      const message = encodeURIComponent(TEST_NOTIFICATION)
      const fromEmail = `mailgun@${data.domain}`

      return `apiKey = secrets.get(key: "${data.apiKey}")
auth = http.basicAuth(u: "api", p: "\${apiKey}")
url = "https://api.mailgun.net/v3/${data.domain}/messages"
data = strings.joinStr(arr: [
  "from=${fromEmail}",
  "to=${data.email}",
  "subject=${subject}",
  "text=${message}"
], v: "&"
)

http.post(
  url: url,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": "\${auth}"
  },
  data: bytes(v: data)
)

array.from(rows: [{value: 0}])
  |> yield(name: "ignore")
`
    },
  })
}
