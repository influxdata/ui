import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
} from 'src/timeMachine/constants/queryBuilder'
import {DEFAULT_THRESHOLDS_LIST_COLORS} from 'src/shared/constants/thresholds'
import {Color, SingleStatViewProperties} from 'src/types'

export default {
  type: 'single-stat',
  shape: 'chronograf-v2',
  legend: {},

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

  colors: DEFAULT_THRESHOLDS_LIST_COLORS as Color[],
  prefix: '',
  tickPrefix: '',
  suffix: '',
  tickSuffix: '',
  note: '',
  showNoteWhenEmpty: false,
  decimalPlaces: {
    isEnforced: true,
    digits: 2,
  },
} as SingleStatViewProperties
