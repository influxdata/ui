export const COLUMN_MIN_WIDTH = 100
export const CELL_HORIZONTAL_PADDING = 30
export const ROW_HEIGHT = 30
export const DEFAULT_FIX_FIRST_COLUMN = true
export const DEFAULT_VERTICAL_TIME_AXIS = true
export const ASCENDING = 'asc'
export const DESCENDING = 'desc'
export const DEFAULT_SORT_DIRECTION = ASCENDING
export const KEYS_I_HATE = ['_start', '_stop']
export const NULL_ARRAY_INDEX = -1

export interface TimeField {
  internalName: string
  displayName: string
  visible: boolean
}

export const DEFAULT_TIME_FIELD: TimeField = {
  internalName: '_time',
  displayName: 'time',
  visible: true,
}
