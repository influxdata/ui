import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {Color, HistogramViewProperties} from 'src/types'
import {
  LEGEND_OPACITY_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
} from 'src/visualization/constants'

export default {
  queries: [],
  type: 'histogram',
  shape: 'chronograf-v2',
  xColumn: '_value',
  xDomain: null,
  xAxisLabel: '',
  fillColumns: null,
  position: 'stacked',
  binCount: 30,
  colors: DEFAULT_LINE_COLORS as Color[],
  legendOpacity: LEGEND_OPACITY_DEFAULT,
  legendOrientationThreshold: LEGEND_ORIENTATION_THRESHOLD_DEFAULT,

  note: '',
  showNoteWhenEmpty: false,
} as HistogramViewProperties
