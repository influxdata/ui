import {IconFont} from '@influxdata/clockface'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'notification',
    family: 'output',
    priority: 1,
    component: View,
    readOnlyComponent: ReadOnly,
    featureFlag: 'flow-panel--notification',
    button: 'Alert',
    description: 'Get notified on your data',
    icon: IconFont.Bell,
    initial: {
      interval: '10m',
      offset: '0s',
      thresholds: [
        {
          type: 'greater',
          value: 0,
        },
      ],
      message:
        '${strings.title(v: r._type)} for ${r._source_measurement} triggered at ${time(v: r._source_timestamp)}!',
      endpoint: 'slack',
      endpointData: {
        url: 'https://hooks.slack.com/services/X/X/X',
      },
    },
    visual: (_data, query) => {
      return query
    },
  })
}
