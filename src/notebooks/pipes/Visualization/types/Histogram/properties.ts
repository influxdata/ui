import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {Color, HistogramViewProperties} from 'src/types'

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
  note: '',
  showNoteWhenEmpty: false,
} as HistogramViewProperties
