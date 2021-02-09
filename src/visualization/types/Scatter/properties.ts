import {NINETEEN_EIGHTY_FOUR} from '@influxdata/giraffe'
import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
} from 'src/timeMachine/constants/queryBuilder'
import {
  LEGEND_OPACITY_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
} from 'src/visualization/constants'
import {ScatterViewProperties} from 'src/types'

export default {
  type: 'scatter',
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

  colors: NINETEEN_EIGHTY_FOUR,
  legendOpacity: LEGEND_OPACITY_DEFAULT,
  legendOrientationThreshold: LEGEND_ORIENTATION_THRESHOLD_DEFAULT,

  note: '',
  showNoteWhenEmpty: false,
  fillColumns: null,
  symbolColumns: null,
  xColumn: null,
  xDomain: null,
  yColumn: null,
  yDomain: null,
  xAxisLabel: '',
  yAxisLabel: '',
  xPrefix: '',
  xSuffix: '',
  yPrefix: '',
  ySuffix: '',

  generateXAxisTicks: [],
  generateYAxisTicks: [],
  xTotalTicks: null,
  xTickStart: null,
  xTickStep: null,
  yTotalTicks: null,
  yTickStart: null,
  yTickStep: null,
} as ScatterViewProperties
