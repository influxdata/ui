import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
} from 'src/timeMachine/constants/queryBuilder'
import {TableViewProperties} from 'src/types'
import {DEFAULT_TABLE_COLORS} from '@influxdata/giraffe'

export const TableProperties = {
  type: 'table',
  shape: 'chronograf-v2',
  queries: [
    {
      name: '',
      text: '',
      editMode: 'builder',
      builderConfig: {
        buckets: [],
        tags: [
          {
            key: '_measurement',
            values: [],
            aggregateFunctionType: 'filter',
          },
        ],
        functions: [{name: 'mean'}],
        aggregateWindow: {
          period: AGG_WINDOW_AUTO,
          fillValues: DEFAULT_FILLVALUES,
        },
      },
    },
  ],
  tableOptions: {
    verticalTimeAxis: true,
    sortBy: null,
    fixFirstColumn: false,
  },
  colors: DEFAULT_TABLE_COLORS,
  fieldOptions: [],
  decimalPlaces: {
    isEnforced: false,
    digits: 2,
  },
  timeFormat: 'YYYY-MM-DD HH:mm:ss',
  note: '',
  showNoteWhenEmpty: false,
} as TableViewProperties
