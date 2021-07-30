import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

export default register =>
  register({
    type: 'intro',
    init: () => ({
      name: 'Welcome to Notebooks',
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
    }),
  })
