import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

export default register =>
  register({
    type: 'task',
    init: () => ({
      spec: {
        readOnly: false,
        range: DEFAULT_TIME_RANGE,
        refresh: AUTOREFRESH_DEFAULT,
        pipes: [
          {
            mode: 'preview',
            text:
              "#### Creating tasks\n\nBy adding a `Schedule` panel to your notebook, you can run queries at a regular interval.\n\nUse the `Preview` button above to test your query as you build it and the `Export as Task` button when you are ready to create your task.\n\nWe've started you off with a blank Flux editor. Click on the purple plus button to find more data sources and transformations.",
            type: 'markdown',
            title: 'Helpful Tips',
            visible: true,
          },
          {
            activeQuery: 0,
            queries: [
              {
                text:
                  '// Uncomment the following line to continue building from the previous cell\n// __PREVIOUS_RESULT__\n',
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
            type: 'visualization',
            properties: {
              type: 'simple-table',
              showAll: false,
            },
            period: '10s',
            title: 'Validate the Data',
            visible: true,
          },
          {
            type: 'schedule',
            title: 'Schedule',
            visible: true,
          },
        ],
      },
    }),
  })
