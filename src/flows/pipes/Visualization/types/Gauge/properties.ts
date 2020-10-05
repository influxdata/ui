import {DEFAULT_GAUGE_COLORS} from 'src/shared/constants/thresholds'
import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
} from 'src/timeMachine/constants/queryBuilder'
import {Color, GaugeViewProperties} from 'src/types'

export default {
  type: 'gauge',
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

  colors: DEFAULT_GAUGE_COLORS as Color[],
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
} as GaugeViewProperties
