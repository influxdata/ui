import {EndpointTypeRegistration} from 'src/types'
import {SendGridReadOnly} from './readOnly'
import {SendGrid} from './view'
import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'

export class Endpoint implements EndpointTypeRegistration {
  type = 'sendgrid'
  name = 'SendGrid Email'
  data = {
    url: 'https://api.sendgrid.com/v3/mail/send',
    apiKey: '',
    email: '',
    fromEmail: 'alerts@influxdata.com',
  }
  featureFlag = 'notebooksNewEndpoints'
  component = SendGrid
  readOnlyComponent = SendGridReadOnly
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
      return {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer \${apiKey}"
        },
        data: json.encode(v: {
          "personalizations": [
            {
              "to": [
                {
                  "email": "${data.email}"
                }
              ],
              "subject": "InfluxDB Alert",
            }
          ],
          "from": {
            "email": "${data.fromEmail}"
          },
          "content": [
            {
              "type": "text/plain",
              "value": r._message
            }
          ]
        })
      }
    }
  )
)`
  }
  generateTestQuery(data) {
    return `
  apiKey = secrets.get(key: "${data.apiKey}")
  http.post(
    url: "${data.url}",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer \${apiKey}"
    },
    data: json.encode(v: {
      "personalizations": [
        {
          "to": [
            {
              "email": "${data.email}"
            }
          ],
          "subject": "InfluxDB Alert"
        }
      ],
      "from": {
        "email": "${data.fromEmail}"
      },
      "content": [
        {
          "type": "text/plain",
          "value": "${TEST_NOTIFICATION}"
        }
      ]
    })
  )
  array.from(rows: [{value: 0}])
      |> yield(name: "ignore")`
  }
}
