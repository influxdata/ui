import {EndpointTypeRegistration} from 'src/types'
import {MailjetReadOnly} from './readOnly'
import {Mailjet} from './view'
import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'

export class Endpoint implements EndpointTypeRegistration {
  type = 'mailjet'
  name = 'Mailjet Email'
  data = {
    url: 'https://api.mailjet.com/v3.1/send',
    apiKey: '',
    apiSecret: '',
    email: '',
    fromEmail: 'alerts@influxdata.com',
  }
  featureFlag = 'notebooksNewEndpoints'
  component = Mailjet
  readOnlyComponent = MailjetReadOnly
  generateImports() {
    return ['http', 'influxdata/influxdb/secrets', 'json']
      .map(i => `import "${i}"`)
      .join('\n')
  }
  generateTestImports() {
    return ['array', 'http', 'influxdata/influxdb/secrets', 'json']
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
|> monitor["notify"](
  data: notification,
  endpoint: http.endpoint(url: "${data.url}")(
    mapFn: (r) => {
      apiKey = secrets.get(key: "${data.apiKey}")
      apiSecret = secrets.get(key: "${data.apiSecret}")
      auth = http.basicAuth(u: apiKey, p: apiSecret)

      return {
        headers: {
          "Content-Type": "application/json",
          "Authorization": auth
        },
        data: json.encode(v: {
          "Messages": [{
            "From": {
              "Email": "${data.fromEmail}"
            },
            "To": [{
              "Email": "${data.email}"
            }],
            "Subject": "InfluxDB Alert",
            "TextPart": r._message
          }]
        })
      }
    }
  )
)`
  }
  generateTestQuery(data) {
    return `
  apiKey = secrets.get(key: "${data.apiKey}")
  apiSecret = secrets.get(key: "${data.apiSecret}")
  auth = http.basicAuth(u: apiKey, p: apiSecret)

  http.post(
    url: "${data.url}",
    headers: {
      "Content-Type": "application/json",
      "Authorization": auth
    },
    data: json.encode(v: {
      "Messages": [{
        "From": {
          "Email": "${data.fromEmail}"
        },
        "To": [{
          "Email": "${data.email}"
        }],
        "Subject": "InfluxDB Alert",
        "TextPart": "${TEST_NOTIFICATION}"
      }]
    }))

  array.from(rows: [{value: 0}])
      |> yield(name: "ignore")`
  }
}
