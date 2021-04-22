export {Query, Dialect} from 'src/client'

type Nullable<T> = T | null

export type SelectableTimeRangeLower =
  | 'now() - 5m'
  | 'now() - 15m'
  | 'now() - 1h'
  | 'now() - 3h'
  | 'now() - 6h'
  | 'now() - 12h'
  | 'now() - 24h'
  | 'now() - 2d'
  | 'now() - 7d'
  | 'now() - 30d'

export type TimeRange =
  | SelectableDurationTimeRange
  | DurationTimeRange
  | CustomTimeRange

export interface SelectableDurationTimeRange {
  lower: SelectableTimeRangeLower
  upper: Nullable<string>
  seconds: number
  format?: string
  label: string
  duration: string
  type: 'selectable-duration'
  windowPeriod: number
}

export interface DurationTimeRange {
  lower: string
  upper: Nullable<string>
  type: 'duration'
}

export interface CustomTimeRange {
  lower: string
  upper: string
  type: 'custom'
}
