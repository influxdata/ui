import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'aws',
    name: 'AWS SES Email',
    data: {
      url: '',
      authAlgo: '',
      accessKey: '',
      credScope: '',
      signedHeaders: '',
      calcSignature: '',
      email: '',
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
              "Authorization": "${data.authAlgo} Credential=${data.accessKey}/${data.credScope},SignedHeaders=${data.signedHeaders},Signature=${data.calcSignature}"
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
    http.post(
      url: "${data.url}",
      headers: {
        "Content-type": "application/json",
        "Authorization": "${data.authAlgo} Credential=${data.accessKey}/${data.credScope},SignedHeaders=${data.signedHeaders},Signature=${data.calcSignature}"
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
