import View from './view'
import ReadOnly from './readOnly'
import {PipeData} from 'src/types'

const removeNotificationThresholds = data => {
  delete data.thresholds
}

export default register => {
  register({
    type: 'notification',
    family: 'output',
    priority: 1,
    component: View,
    readOnlyComponent: ReadOnly,
    featureFlag: 'flow-panel--notification',
    button: 'Alert',
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
    beforeRemove: (data: PipeData) => removeNotificationThresholds(data),
    visual: (_data, query) => {
      return query
    },
  })
}
