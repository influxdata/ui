export enum ThresholdFormat {
  Value = 'value',
  Range = 'range',
  Deadman = 'deadman',
}

export enum ThresholdType {
  Greater = 'greater',
  GreaterEqual = 'greater-equal',
  Less = 'less',
  LessEqual = 'less-equal',
  Equal = 'equal',
  NotEqual = 'not-equal',
  Between = 'between',
  NotBetween = 'not-between',
  Deadman = 'missing-for-longer-than',
}

export type Threshold = {
  value: number
  type: ThresholdType
  field: string
  max?: number
  min?: number
  deadmanCheckValue?: string
  deadmanStopValue: string
}

export interface ErrorThreshold extends Threshold {
  fieldType: string
}

export function validateThreshold(t: Threshold): boolean {
  switch (t.type) {
    case ThresholdType.Greater:
    case ThresholdType.GreaterEqual:
    case ThresholdType.Less:
    case ThresholdType.LessEqual:
    case ThresholdType.NotEqual:
      if (!t.field || !(t.value == 0 || !!t.value)) {
        throw new Error(
          `A ${t.type} comparison, requires a selected field and selected value.`
        )
      }
      break
    case ThresholdType.Between:
    case ThresholdType.NotBetween:
      if (!t.field || !(t.max == 0 || !!t.max) || !(t.min == 0 || !!t.min)) {
        throw new Error(
          `A ${t.type} comparison, requires a selected field and selected min & max.`
        )
      }
      break
    case ThresholdType.Deadman:
      // FIXME: get input from Ari
      return true
  }

  return true
}

export const EQUALITY_THRESHOLD_TYPES = {
  [ThresholdType.Equal]: {
    name: 'equal to',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) && `(r) => (r["${data.field}"] == ${data.value})`,
  },
  [ThresholdType.NotEqual]: {
    name: 'not equal to',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) && `(r) => (r["${data.field}"] != ${data.value})`,
  },
}

export const COMMON_THRESHOLD_TYPES = {
  ...EQUALITY_THRESHOLD_TYPES,
  [ThresholdType.Greater]: {
    name: 'greater than',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) && `(r) => (r["${data.field}"] > ${data.value})`,
  },
  [ThresholdType.GreaterEqual]: {
    name: 'greater than or equal to',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) && `(r) => (r["${data.field}"] >= ${data.value})`,
  },
  [ThresholdType.Less]: {
    name: 'less than',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) && `(r) => (r["${data.field}"] < ${data.value})`,
  },
  [ThresholdType.LessEqual]: {
    name: 'less than or equal to',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) && `(r) => (r["${data.field}"] <= ${data.value})`,
  },
  [ThresholdType.Between]: {
    name: 'between',
    format: ThresholdFormat.Range,
    condition: data =>
      validateThreshold(data) &&
      `(r) => (r["${data.field}"] > ${data.min} and r["${data.field}"] < ${data.max})`,
  },
  [ThresholdType.NotBetween]: {
    name: 'not between',
    format: ThresholdFormat.Range,
    condition: data =>
      validateThreshold(data) &&
      `(r) => (r["${data.field}"] < ${data.min} or r["${data.field}"] > ${data.max})`,
  },
}

export const deadmanType = ThresholdType.Deadman

export const THRESHOLD_TYPES = {
  ...COMMON_THRESHOLD_TYPES,
  [deadmanType]: {
    name: 'missing for longer than',
    format: ThresholdFormat.Deadman,
    condition: data => validateThreshold(data) && `(r) => (r["dead"])`,
  },
}
