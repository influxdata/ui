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
