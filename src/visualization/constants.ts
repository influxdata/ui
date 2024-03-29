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

export enum LegendDisplayStatus {
  HIDE = 'hide',
  SHOW = 'show',
}

export const LEGEND_OPACITY_MINIMUM = 0.2
export const LEGEND_OPACITY_MAXIMUM = 1.0
export const LEGEND_OPACITY_DEFAULT = LEGEND_OPACITY_MAXIMUM
export const LEGEND_OPACITY_STEP = 0.01

export const LEGEND_ORIENTATION_THRESHOLD_VERTICAL = -1 // Do not use 0 because 0 is falsy and considered "not set"
export const LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL = 100000000

export const LEGEND_ORIENTATION_THRESHOLD_DEFAULT =
  LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL
export const LEGEND_COLORIZE_ROWS_DEFAULT = true

export const LEGEND_HIDE_DEFAULT = false

export const STATIC_LEGEND_HEIGHT_RATIO_MINIMUM = 0.05
export const STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM = 0.75
export const STATIC_LEGEND_HEIGHT_RATIO_DEFAULT = 0.2
export const STATIC_LEGEND_HEIGHT_RATIO_NOT_SET = 0 // 0 is okay here because we want "not set"
export const STATIC_LEGEND_HEIGHT_RATIO_STEP = 0.01

export const STATIC_LEGEND_SHOW_DEFAULT = false

export const STATIC_LEGEND_WIDTH_RATIO_DEFAULT = 1.0

export const STATIC_LEGEND_CELL_HEIGHT_DEFAULT = 5

export const STATIC_LEGEND_STYLING = {
  backgroundColor: 'transparent',
  border: 'none',
  style: {padding: '1em 0 0 1em'},
}

export const staticLegendTypes = new Set([
  'xy',
  'line-plus-single-stat',
  'band',
])

export const TICK_PROPERTY_PREFIX = 'Tick'
export const TICK_PROPERTY_SUFFIX = 'Ticks'
