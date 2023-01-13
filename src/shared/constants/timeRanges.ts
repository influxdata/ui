import {SelectableDurationTimeRange} from 'src/types'

export const TIME_RANGE_FORMAT = 'YYYY-MM-DD HH:mm'

export const CUSTOM_TIME_RANGE_LABEL =
  'Custom Time Range' as 'Custom Time Range'

export const pastHourTimeRange: SelectableDurationTimeRange = {
  seconds: 3600,
  lower: 'now() - 1h',
  upper: null,
  sql: "time >= now() - interval '1 hour'",
  label: 'Past 1h',
  duration: '1h',
  type: 'selectable-duration',
  windowPeriod: 10000, // 10s
}

export const pastThirtyDaysTimeRange: SelectableDurationTimeRange = {
  seconds: 2592000,
  lower: 'now() - 30d',
  upper: null,
  sql: "time >= now() - interval '30 days'",
  label: 'Past 30d',
  duration: '30d',
  type: 'selectable-duration',
  windowPeriod: 3600000, // 1h
}

export const pastFifteenMinTimeRange: SelectableDurationTimeRange = {
  seconds: 900,
  lower: 'now() - 15m',
  upper: null,
  sql: "time >= now() - interval '15 minutes'",
  label: 'Past 15m',
  duration: '15m',
  type: 'selectable-duration',
  windowPeriod: 10000, // 10s
}

export const pastDayTimeRange: SelectableDurationTimeRange = {
  seconds: 86400,
  lower: 'now() - 24h',
  upper: null,
  sql: "time >= now() - interval '1 day'",
  label: 'Past 24h',
  duration: '24h',
  type: 'selectable-duration',
  windowPeriod: 240000, // 4m
}

export const CUSTOM_TIME_RANGE: {label: string; type: 'custom'} = {
  label: 'Custom Time Range' as 'Custom Time Range',
  type: 'custom',
}

export const SELECTABLE_TIME_RANGES: SelectableDurationTimeRange[] = [
  {
    seconds: 60,
    lower: 'now() - 1m',
    upper: null,
    sql: "time >= now() - interval '1 minute'",
    label: 'Past 1m',
    duration: '1m',
    type: 'selectable-duration',
    windowPeriod: 1000, // 1s
  },
  {
    seconds: 300,
    lower: 'now() - 5m',
    upper: null,
    sql: "time >= now() - interval '5 minutes'",
    label: 'Past 5m',
    duration: '5m',
    type: 'selectable-duration',
    windowPeriod: 10000, // 10s
  },
  pastFifteenMinTimeRange,
  pastHourTimeRange,
  {
    seconds: 10800,
    lower: 'now() - 3h',
    upper: null,
    sql: "time >= now() - interval '3 hours'",
    label: 'Past 3h',
    duration: '3h',
    type: 'selectable-duration',
    windowPeriod: 60000, // 1m
  },
  {
    seconds: 21600,
    lower: 'now() - 6h',
    upper: null,
    sql: "time >= now() - interval '6 hours'",
    label: 'Past 6h',
    duration: '6h',
    type: 'selectable-duration',
    windowPeriod: 60000, // 1m
  },
  {
    seconds: 43200,
    lower: 'now() - 12h',
    upper: null,
    sql: "time >= now() - interval '12 hours'",
    label: 'Past 12h',
    duration: '12h',
    type: 'selectable-duration',
    windowPeriod: 120000, // 2m
  },
  pastDayTimeRange,
  {
    seconds: 172800,
    lower: 'now() - 2d',
    upper: null,
    sql: "time >= now() - interval '2 days'",
    label: 'Past 2d',
    duration: '2d',
    type: 'selectable-duration',
    windowPeriod: 600000, // 10m
  },
  {
    seconds: 604800,
    lower: 'now() - 7d',
    upper: null,
    sql: "time >= now() - interval '7 days'",
    label: 'Past 7d',
    duration: '7d',
    type: 'selectable-duration',
    windowPeriod: 1800000, // 30 min
  },
  pastThirtyDaysTimeRange,
]

export const SELECTABLE_USAGE_TIME_RANGES: SelectableDurationTimeRange[] = [
  pastDayTimeRange,
  {
    seconds: 604800,
    lower: 'now() - 7d',
    upper: null,
    sql: "time >= now() - interval '7 days'",
    label: 'Past 7d',
    duration: '7d',
    type: 'selectable-duration',
    windowPeriod: 1800000, // 30 min
  },
  pastThirtyDaysTimeRange,
]

export const DEFAULT_USAGE_TIME_RANGE = pastDayTimeRange
export const DEFAULT_TIME_RANGE = pastHourTimeRange
