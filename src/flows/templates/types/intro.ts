import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

export default register =>
  register({
    type: 'intro',
    init: () => Promise.resolve({
      name: 'Welcome to Notebooks',
      spec: {
        readOnly: false,
        range: DEFAULT_TIME_RANGE,
        refresh: AUTOREFRESH_DEFAULT,
        pipes: [
          {
            title: 'Welcome',
            visible: true,
            type: 'youtube',
            uri: 'Rs16uhxK0h8',
          },
        ],
      },
    }),
  })
