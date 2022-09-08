import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

export default register =>
  register({
    type: 'flux',
    init: () =>
      Promise.resolve({
        spec: {
          readOnly: false,
          range: DEFAULT_TIME_RANGE,
          refresh: AUTOREFRESH_DEFAULT,
          pipes: [
            {
              activeQuery: 0,
              queries: [
                {
                  text: '// Uncomment the following line to continue building from the previous cell\n// __PREVIOUS_RESULT__\n',
                  editMode: 'advanced',
                  builderConfig: {
                    buckets: [],
                    tags: [],
                    functions: [],
                  },
                },
              ],
              type: 'rawFluxEditor',
              title: 'Query to Run',
              visible: true,
            },
            {
              title: 'Validate the Data',
              visible: true,
              type: 'table',
            },
          ],
        },
      }),
  })
