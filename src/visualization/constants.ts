import {AxisScale, Base} from 'src/types'

export const MIN_DECIMAL_PLACES = 0
export const MAX_DECIMAL_PLACES = 10

export const AXES_SCALE_OPTIONS = {
  LINEAR: 'linear' as AxisScale,
  LOG: 'log' as AxisScale,
  BASE_2: '2' as Base,
  BASE_10: '10' as Base,
}

export const INVALID_DATA_COPY =
  "The data returned from the query can't be visualized with this graph type."

export const BAND_LINE_OPACITY = 0.7
export const BAND_LINE_WIDTH = 3
export const BAND_SHADE_OPACITY = 0.3

export const LEGEND_OPACITY_MINIMUM = 0.2
export const LEGEND_OPACITY_MAXIMUM = 1.0
export const LEGEND_OPACITY_DEFAULT = LEGEND_OPACITY_MAXIMUM
export const LEGEND_OPACITY_STEP = 0.01

export const LEGEND_ORIENTATION_THRESHOLD_VERTICAL = 0
export const LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL = 100000000

export const LEGEND_ORIENTATION_THRESHOLD_DEFAULT = LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL
export const LEGEND_COLORIZE_ROWS_DEFAULT = true
