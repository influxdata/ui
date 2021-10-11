import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {PIPE_DEFINITIONS} from 'src/flows'

export default register =>
  register({
    type: 'bucket',
    init: name => ({
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
            },
            period: '10s',
            title: 'Validate the Data',
            visible: true,
          },
          {
            type: 'visualization',
            period: '10s',
            functions: [{name: 'mean'}],
            properties: {
              axes: {
                x: {
                  base: '10',
                  bounds: ['', ''],
                  label: '',
                  prefix: '',
                  scale: 'linear',
                  suffix: '',
                },
                y: {
                  base: '10',
                  bounds: ['', ''],
                  label: '',
                  prefix: '',
                  scale: 'linear',
                  suffix: '',
                },
              },
              colors: [
                {
                  hex: '#31C0F6',
                  id: 'd001b766-bf5c-4ae3-a867-9a3774849cc1',
                  name: 'Nineteen Eighty Four',
                  type: 'scale',
                  value: 0,
                },
                {
                  hex: '#A500A5',
                  id: '547f5c28-4e2a-4c06-af49-a02e6fd11c5f',
                  name: 'Nineteen Eighty Four',
                  type: 'scale',
                  value: 0,
                },
                {
                  hex: '#FF7E27',
                  id: '3c0dadaf-f8aa-45a4-ba1a-3597b685b76f',
                  name: 'Nineteen Eighty Four',
                  type: 'scale',
                  value: 0,
                },
              ],
              generateXAxisTicks: [],
              generateYAxisTicks: [],
              geom: 'line',
              hoverDimension: 'auto',
              legendOpacity: 1,
              legendOrientationThreshold: 100000000,
              note: '',
              position: 'overlaid',
              queries: [
                {
                  builderConfig: {
                    aggregateWindow: {
                      fillValues: false,
                      period: 'auto',
                    },
                    buckets: [],
                    functions: [
                      {
                        name: 'mean',
                      },
                    ],
                    tags: [
                      {
                        aggregateFunctionType: 'filter',
                        key: '_measurement',
                        values: [],
                      },
                    ],
                  },
                  editMode: 'builder',
                  name: '',
                  text: '',
                },
              ],
              shape: 'chronograf-v2',
              showNoteWhenEmpty: false,
              staticLegend: {
                heightRatio: 0.2,
                hide: true,
                widthRatio: 1,
              },
              type: 'xy',
              xColumn: null,
              xTickStart: null,
              xTickStep: null,
              xTotalTicks: null,
              yColumn: null,
              yTickStart: null,
              yTickStep: null,
              yTotalTicks: null,
            },
            title: 'Visualize the Result',
            visible: true,
          },
        ],
      },
    }),
  })
