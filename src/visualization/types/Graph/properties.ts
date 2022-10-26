import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
} from 'src/timeMachine/constants/queryBuilder'

import {Axis, Base, Color, XYViewProperties} from 'src/types'
import {
  LEGEND_COLORIZE_ROWS_DEFAULT,
  LEGEND_OPACITY_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
  STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
  STATIC_LEGEND_SHOW_DEFAULT,
  STATIC_LEGEND_WIDTH_RATIO_DEFAULT,
} from 'src/visualization/constants'

export const GraphProperties = {
  type: 'xy',
  shape: 'chronograf-v2',
  geom: 'line',
  xColumn: null,
  yColumn: null,
  position: 'overlaid',
  hoverDimension: 'auto',

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

  colors: DEFAULT_LINE_COLORS as Color[],
  legendColorizeRows: LEGEND_COLORIZE_ROWS_DEFAULT,
  legendOpacity: LEGEND_OPACITY_DEFAULT,
  legendOrientationThreshold: LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
  staticLegend: {
    colorizeRows: LEGEND_COLORIZE_ROWS_DEFAULT,
    heightRatio: STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
    opacity: LEGEND_OPACITY_DEFAULT,
    orientationThreshold: LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
    show: STATIC_LEGEND_SHOW_DEFAULT,
    widthRatio: STATIC_LEGEND_WIDTH_RATIO_DEFAULT,
  },

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

  generateXAxisTicks: [],
  generateYAxisTicks: [],
  xTotalTicks: null,
  xTickStart: null,
  xTickStep: null,
  yTotalTicks: null,
  yTickStart: null,
  yTickStep: null,
} as XYViewProperties
