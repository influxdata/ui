import {INFERNO} from '@influxdata/giraffe'
import {HeatmapViewProperties} from 'src/types'

export default {
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
  binSize: 10,
  note: '',
  showNoteWhenEmpty: false,
} as HeatmapViewProperties
