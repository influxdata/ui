import {INFERNO} from '@influxdata/giraffe'
import {HeatmapViewProperties} from 'src/types'
import {
  LEGEND_COLORIZE_ROWS_DEFAULT,
  LEGEND_OPACITY_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
} from 'src/visualization/constants'

export const HeatmapProperties = {
  queries: [],
  type: 'heatmap',
  shape: 'chronograf-v2',
  xColumn: null,
  yColumn: null,
  xDomain: null,
  yDomain: null,
  xAxisLabel: '',
  yAxisLabel: '',
  xPrefix: '',
  xSuffix: '',
  yPrefix: '',
  ySuffix: '',
  colors: INFERNO,
  legendColorizeRows: LEGEND_COLORIZE_ROWS_DEFAULT,
  legendOpacity: LEGEND_OPACITY_DEFAULT,
  legendOrientationThreshold: LEGEND_ORIENTATION_THRESHOLD_DEFAULT,

  binSize: 10,
  note: '',
  showNoteWhenEmpty: false,

  generateXAxisTicks: [],
  generateYAxisTicks: [],
  xTotalTicks: null,
  xTickStart: null,
  xTickStep: null,
  yTotalTicks: null,
  yTickStart: null,
  yTickStep: null,
} as HeatmapViewProperties
