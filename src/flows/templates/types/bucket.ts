import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {PIPE_DEFINITIONS} from 'src/flows'

export default register =>
  register({
    type: 'bucket',
    init: name =>
      Promise.resolve({
        name: `Explore the ${name} bucket`,
        spec: {
          readOnly: false,
          range: DEFAULT_TIME_RANGE,
          refresh: AUTOREFRESH_DEFAULT,
          pipes: [
            {
              type: 'queryBuilder',
              title: 'Build a Query',
              visible: true,
              ...JSON.parse(
                JSON.stringify(PIPE_DEFINITIONS['queryBuilder'].initial)
              ),
              buckets: [name],
            },
            {
              type: 'visualization',
              properties: {
                type: 'simple-table',
                showAll: false,
                title: 'Validate the Data',
              },
            },
            {
              title: 'Visualize the Result',
              visible: true,
              type: 'visualization',
              ...JSON.parse(
                JSON.stringify(PIPE_DEFINITIONS['visualization'].initial)
              ),
            },
          ],
        },
      }),
  })
