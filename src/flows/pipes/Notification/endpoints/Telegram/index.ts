import {EndpointTypeRegistration} from 'src/types'
import {TEST_NOTIFICATION} from 'src/flows/pipes/Notification/endpoints'
import {TelegramReadOnly} from './readOnly'
import {Telegram} from './view'

export class Endpoint implements EndpointTypeRegistration {
  type = 'telegram'
  name = 'Telegram'
  data = {
    url: 'https://api.telegram.org/bot',
    channel: '',
    token: '',
    parseMode: 'MarkdownV2',
  }
  featureFlag = 'notebooksNewEndpoints'
  component = Telegram
  readOnlyComponent = TelegramReadOnly
  generateImports() {
    return ['contrib/sranka/telegram', 'influxdata/influxdb/secrets']
      .map(i => `import "${i}"`)
      .join('\n')
  }
  generateTestImports() {
    return ['array', 'contrib/sranka/telegram', 'influxdata/influxdb/secrets']
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
  endpoint: telegram["endpoint"](
    url: "${data.url}",
    token: secrets.get(key: "${data.token}"),
    parseMode: "${data.parseMode}",
    disableWebPagePreview: false
    )(
      mapFn: (r) => ({
        channel: "${data.channel}",
        text: "\${ r._message }",
        silent: true
  }))
)`
  }
  generateTestQuery(data) {
    return `
    telegram.message(
      url: "${data.url}",
      token: secrets.get(key: "${data.token}"),
      parseMode: "${data.parseMode}",
      channel: "${data.channel}",
      text: "${TEST_NOTIFICATION}",
      disableWebPagePreview: false,
      silent: true
    )

    array.from(rows: [{value: 0}])
        |> yield(name: "ignore")`
  }
}
