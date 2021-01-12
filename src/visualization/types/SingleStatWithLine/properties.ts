import {DEFAULT_THRESHOLDS_LIST_COLORS} from 'src/shared/constants/thresholds'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
} from 'src/timeMachine/constants/queryBuilder'
import {
  LEGEND_OPACITY_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
} from 'src/visualization/constants'

import {Axis, Base, Color, LinePlusSingleStatProperties} from 'src/types'

export default {
  type: 'line-plus-single-stat',
  shape: 'chronograf-v2',
  xColumn: null,
  yColumn: null,
  position: 'overlaid',

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

  legend: {},
  legendOpacity: LEGEND_OPACITY_DEFAULT,
  legendOrientationThreshold: LEGEND_ORIENTATION_THRESHOLD_DEFAULT,

  note: '',
  showNoteWhenEmpty: false,
  axes: {
    x: {
      bounds: ['', ''],
      label: '',
      prefix: '',
      suffix: '',
      base: '10',
      scale: 'linear',
    } as Axis,
    y: {
      bounds: ['', ''],
      label: '',
      prefix: '',
      suffix: '',
      base: '10' as Base,
      scale: 'linear',
    } as Axis,
  },
  colors: [
    ...(DEFAULT_LINE_COLORS as Color[]),
    ...(DEFAULT_THRESHOLDS_LIST_COLORS as Color[]),
  ],
  prefix: '',
  tickPrefix: '',
  suffix: '',
  tickSuffix: '',
  decimalPlaces: {
    isEnforced: true,
    digits: 2,
  },
  generateXAxisTicks: [],
  generateYAxisTicks: [],
  xTotalTicks: null,
  xTickStart: null,
  xTickStep: null,
  yTotalTicks: null,
  yTickStart: null,
  yTickStep: null,
} as LinePlusSingleStatProperties
