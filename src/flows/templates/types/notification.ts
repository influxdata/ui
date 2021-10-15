import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {PIPE_DEFINITIONS} from 'src/flows'

export default register =>
  register({
    type: 'notification',
    init: () =>
      Promise.resolve({
        spec: {
          readOnly: false,
          range: DEFAULT_TIME_RANGE,
          refresh: AUTOREFRESH_DEFAULT,
          pipes: [
            {
              title: 'Build a Query',
              visible: true,
              type: 'queryBuilder',
              ...JSON.parse(
                JSON.stringify(PIPE_DEFINITIONS['queryBuilder'].initial)
              ),
            },
            {
              title: 'Validate the Data',
              visible: true,
              type: 'table',
            },
            {
              title: 'Visualize the Result',
              visible: true,
              type: 'visualization',
              ...JSON.parse(
                JSON.stringify(PIPE_DEFINITIONS['visualization'].initial)
              ),
            },
            {
              type: 'notification',
              visible: true,
              title: 'New Alert',
              ...JSON.parse(
                JSON.stringify(PIPE_DEFINITIONS['notification'].initial)
              ),
            },
          ],
        },
      }),
  })
