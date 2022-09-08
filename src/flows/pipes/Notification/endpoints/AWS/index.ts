import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'aws',
    name: 'AWS SES Email',
    data: {
      url: 'https://email.your-aws-region.amazonaws.com/sendemail/v2/email/outbound-emails',
      authAlgo: '',
      accessKey: '',
      credScope: '',
      signedHeaders: '',
      calcSignature: '',
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
  )`,
    generateTestQuery: data => `
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
        |> yield(name: "ignore")`,
  })
}
