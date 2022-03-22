import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'zenoss',
    name: 'Zenoss',
    data: {
      url: 'https://example.zenoss.io:8080/zport/dmd/evconsole_router',
      username: '',
      password: '',
      action: '',
      method: '',
      severity: '',
    },
    featureFlag: 'notebooksNewEndpoints',
    component: View,
    readOnlyComponent: ReadOnly,
    generateImports: () =>
      ['contrib/bonitoo-io/zenoss', 'influxdata/influxdb/secrets']
        .map(i => `import "${i}"`)
        .join('\n'),
    generateTestImports: () =>
      ['array', 'contrib/bonitoo-io/zenoss', 'influxdata/influxdb/secrets']
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
	|> monitor["notify"](
    data: notification,
    endpoint: zenoss["endpoint"](
      url: "${data.url}",
      username: secrets.get(key: "${data.username}"),
      password: secrets.get(key: "${data.password}"),
      action: "${data.action}",
      method: "${data.method}",
      )(
        mapFn: (r) => ({
          message: "\${ r._message }",
          severity: "${data.severity}",
          summary: "${data.severity} event for \${ r.host }",
          device: "\${ r.deviceID }",
          component: "\${ r.host }",
          eventClass: "/App",
          eventClassKey: "",
          collector: "",
    }))
  )`,
    generateTestQuery: data => `
    telegram.endpoint(
      url: "${data.url}",
      username: secrets.get(key: "${data.username}"),
      password: secrets.get(key: "${data.password}"),
      action: "${data.action}",
      method: "${data.method}",
      message: "${TEST_NOTIFICATION}",
      severity: "${data.severity}",
    )

    array.from(rows: [{value: 0}])
        |> yield(name: "ignore")`,
  })
}
