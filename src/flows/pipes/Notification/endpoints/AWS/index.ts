import {AWSReadOnly} from './readOnly'
import {AWS} from './view'
import {EndpointTypeRegistration} from 'src/types'
import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'

export class Endpoint implements EndpointTypeRegistration {
  type = 'aws'
  name = 'AWS SES Email'
  data = {
    url: 'https://email.your-aws-region.amazonaws.com/sendemail/v2/email/outbound-emails',
    authAlgo: '',
    accessKey: '',
    credScope: '',
    signedHeaders: '',
    calcSignature: '',
    email: '',
  }
  component = AWS
  readOnlyComponent = AWSReadOnly
  generateImports() {
    return ['http', 'influxdata/influxdb/secrets']
      .map(i => `import "${i}"`)
      .join('\n')
  }
  generateTestImports() {
    return ['array', 'http', 'influxdata/influxdb/secrets']
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
    endpoint: ((r) => {
        authAlgo = secrets.get(key: "${data.authAlgo}")
        accessKey = secrets.get(key: "${data.accessKey}")
        credScope = secrets.get(key: "${data.credScope}")
        signedHeaders = secrets.get(key: "${data.signedHeaders}")
        calcSignature = secrets.get(key: "${data.calcSignature}")
        http.post(
            url: "${data.url}",
            headers: {
              "Content-type": "application/json",
              "Authorization": "\${authAlgo} Credential=\${accessKey}/\${credScope},SignedHeaders=\${signedHeaders},Signature=\${calcSignature}"
            },
            data: bytes(v: "{
              \\"Content\\": {
                \\"Simple\\": {
                  \\"Body\\": {
                    \\"Text\\": {
                      \\"Charset\\": \\"UTF-8\\",
                      \\"Data\\": \\"\${ r._message }\\"
                    }
                  },
                  \\"Subject\\": {
                    \\"Charset\\": \\"UTF-8\\",
                    \\"Data\\": \\"InfluxDB Alert\\"
                  }
                }
              },
              \\"Destination\\": {
                \\"ToAddresses\\": [
                  \\"${data.email}\\"
                ]
              }
            }"))
    })
  )`
  }
  generateTestQuery(data) {
    return `
    authAlgo = secrets.get(key: "${data.authAlgo}")
    accessKey = secrets.get(key: "${data.accessKey}")
    credScope = secrets.get(key: "${data.credScope}")
    signedHeaders = secrets.get(key: "${data.signedHeaders}")
    calcSignature = secrets.get(key: "${data.calcSignature}")
    http.post(
      url: "${data.url}",
      headers: {
        "Content-type": "application/json",
        "Authorization": "\${authAlgo} Credential=\${accessKey}/\${credScope},SignedHeaders=\${signedHeaders},Signature=\${calcSignature}"
      },
      data: bytes(v: "{
        \\"Content\\": {
          \\"Simple\\": {
            \\"Body\\": {
              \\"Text\\": {
                \\"Charset\\": \\"UTF-8\\",
                \\"Data\\": \\"${TEST_NOTIFICATION}\\"
              }
            },
            \\"Subject\\": {
              \\"Charset\\": \\"UTF-8\\",
              \\"Data\\": \\"InfluxDB Alert\\"
            }
          }
        },
        \\"Destination\\": {
          \\"ToAddresses\\": [
            \\"${data.email}\\"
          ]
        }
      }"))

    array.from(rows: [{value: 0}])
      |> yield(name: "ignore")`
  }
}
