import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'http',
    name: 'HTTP Post',
    data: {
      auth: 'none',
      username: '',
      password: '',
      token: '',
      url: 'https://www.example.com/endpoint',
    },
    component: View,
    readOnlyComponent: ReadOnly,
    generateImports: () =>
      ['http', 'influxdata/influxdb/secrets', 'json']
        .map(i => `import "${i}"`)
        .join('\n'),
    generateTestImports: () =>
      ['array', 'http', 'influxdata/influxdb/secrets', 'json']
        .map(i => `import "${i}"`)
        .join('\n'),
    generateQuery: (data, measurement) => {
      const headers = [['"Content-Type"', '"application/json"']]
      let prefixSecrets = ''

      if (data.auth === 'basic') {
        headers.push(['Authorization', 'auth'])
        prefixSecrets = `
          username = secrets.get(key: "${data.username}")
          password = secrets.get(key: "${data.password}")
          auth = http.basicAuth(u: username, p: password)
        `
      }

      if (data.auth === 'bearer') {
        headers.push(['Authorization', `"Bearer \${token}"`])
        prefixSecrets = `
          token = secrets.get(key: "${data.token}")
        `
      }

      const _headers = headers
        .reduce((acc, curr) => {
          acc.push(`${curr[0]}: ${curr[1]}`)
          return acc
        }, [])
        .join(', ')

      const out = `
        ${prefixSecrets}
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
          |> keep(columns: ["_value", "_time", "_measurement"])
          |> limit(n: 1, offset: 0)
          |> monitor["notify"](data: notification, endpoint: http.endpoint(url: "${data.url}")(
            mapFn: (r) => {
                body = {r with _version: 1}
                return {headers: {${_headers}}, data: json.encode(v: body)}
          }))
      `
      return out
    },
    generateTestQuery: data => {
      const headers = [['"Content-Type"', '"application/json"']]
      let prefixSecrets = ''

      if (data.auth === 'basic') {
        headers.push(['Authorization', 'auth'])
        prefixSecrets = `
          username = secrets.get(key: "${data.username}")
          password = secrets.get(key: "${data.password}")
          auth = http.basicAuth(u: username, p: password)
        `
      }

      if (data.auth === 'bearer') {
        headers.push(['Authorization', `"Bearer \${token}"`])
        prefixSecrets = `
          token = secrets.get(key: "${data.token}")
        `
      }

      const _headers = headers
        .reduce((acc, curr) => {
          acc.push(`${curr[0]}: ${curr[1]}`)
          return acc
        }, [])
        .join(', ')

      return `
        ${prefixSecrets}
        http.post(
          url: "${data.url}",
          headers:  {${_headers}},
          data: json.encode(v: { msg: "${TEST_NOTIFICATION}"})
        )
        array.from(rows: [{value: 0}])
        |> yield(name: "ignore")
      `
    },
  })
}
