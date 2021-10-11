import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'http',
    name: 'HTTP Post',
    data: {
      auth: 'none',
      url: 'https://www.example.com/endpoint',
    },
    component: View,
    readOnlyComponent: ReadOnly,
    generateImports: () =>
      ['http', 'json'].map(i => `import "${i}"`).join('\n'),
    generateTestImports: () =>
      ['array', 'http', 'json'].map(i => `import "${i}"`).join('\n'),
    generateQuery: data => {
      const headers = [['"Content-Type"', '"application/json"']]

      if (data.auth === 'basic') {
        headers.push([
          'Authorization',
          `http.basicAuth(u:"${data.username}", p:"${data.password}")`,
        ])
      }

      if (data.auth === 'bearer') {
        headers.push(['Authorization', `"Bearer ${data.token}"`])
      }

      const _headers = headers
        .reduce((acc, curr) => {
          acc.push(`${curr[0]}: ${curr[1]}`)
          return acc
        }, [])
        .join(', ')

      const out = `task_data
	|> schema["fieldsAsCols"]()
      |> set(key: "_notebook_link", value: "${window.location.href}")
	|> monitor["check"](
		data: check,
		messageFn: messageFn,
		crit: trigger,
	)
	|> monitor["notify"](data: notification, endpoint: http["endpoint"](url: "${data.url}")(mapFn: (r) => {
      body = {r with _version: 1}
      return {headers: {${_headers}}, data: json["encode"](v: body)}
  }))`
      return out
    },
    generateTestQuery: data => {
      const headers = [['"Content-Type"', '"application/json"']]

      if (data.auth === 'basic') {
        headers.push([
          'Authorization',
          `http.basicAuth(u:"${data.username}", p:"${data.password}")`,
        ])
      }

      if (data.auth === 'bearer') {
        headers.push(['Authorization', `"Bearer ${data.token}"`])
      }

      const _headers = headers
        .reduce((acc, curr) => {
          acc.push(`${curr[0]}: ${curr[1]}`)
          return acc
        }, [])
        .join(', ')

      return `http["endpoint"](url: "${data.url}")(mapFn: (r) => {
      return {headers: {${_headers}}, data: json["encode"](v: "${TEST_NOTIFICATION}")}
  })

  array.from(rows: [{value: 0}])
	|> yield(name: "ignore")`
    },
  })
}
