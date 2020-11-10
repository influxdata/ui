import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
} from 'src/timeMachine/constants/queryBuilder'
import {DEFAULT_THRESHOLDS_TABLE_COLORS} from 'src/shared/constants/thresholds'
import {Color, TableViewProperties} from 'src/types'

export default {
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

  colors: DEFAULT_THRESHOLDS_TABLE_COLORS as Color[],
  tableOptions: {
    verticalTimeAxis: true,
    sortBy: null,
    fixFirstColumn: false,
  },
  fieldOptions: [],
  decimalPlaces: {
    isEnforced: false,
    digits: 2,
  },
  timeFormat: 'YYYY-MM-DD HH:mm:ss',
  note: '',
  showNoteWhenEmpty: false,
} as TableViewProperties
