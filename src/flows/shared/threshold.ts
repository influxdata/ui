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
  // value, min, and max are strings
  // can be string numbers (e.g. '123.2') or lexical strings (e.g. 'a' < 'b')
  value: number
  type: ThresholdType
  field: string
  fieldType: string
  max?: number
  min?: number
  deadmanCheckValue?: string
  deadmanStopValue: string // e.g. '5 minutes'
}

const existenceCheck = unknown => unknown == 0 || !!unknown

const assertSwitchIsExhaustive = (_: never): never => {
  throw new Error('Unreachable')
}

export function validateThreshold(t: Threshold): boolean {
  switch (t.type) {
    case ThresholdType.Greater:
    case ThresholdType.GreaterEqual:
    case ThresholdType.Less:
    case ThresholdType.LessEqual:
    case ThresholdType.Equal:
    case ThresholdType.NotEqual:
      if (!t.field || !existenceCheck(t.value)) {
        throw new Error(
          `A ${t.type} comparison, requires a selected field and value.`
        )
      }
      return true
    case ThresholdType.Between:
    case ThresholdType.NotBetween:
      if (!t.field || !existenceCheck(t.min) || !existenceCheck(t.max)) {
        throw new Error(
          `A ${t.type} comparison, requires a selected field and min & max.`
        )
      }
      return true
    case ThresholdType.Deadman:
      if (!t.field || !existenceCheck(t.deadmanStopValue)) {
        throw new Error(
          `A deadman check requires a designated timespan (e.g. dead for '5 minutes').`
        )
      }
      return true
    default:
      return assertSwitchIsExhaustive(t.type)
  }
}

// hypothetically, `val` could be an object etc
const quoteStringValues = val =>
  isNaN(Number(val)) ? JSON.stringify(val) : val

export const lambdaPrefix = '(r) =>'

export const EQUALITY_THRESHOLD_TYPES = {
  [ThresholdType.Equal]: {
    name: 'equal to',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) &&
      `${lambdaPrefix} (r["${data.field}"] == ${quoteStringValues(
        data.value
      )})`,
  },
  [ThresholdType.NotEqual]: {
    name: 'not equal to',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) &&
      `${lambdaPrefix} (r["${data.field}"] != ${quoteStringValues(
        data.value
      )})`,
  },
}

export const COMMON_THRESHOLD_TYPES = {
  ...EQUALITY_THRESHOLD_TYPES,
  [ThresholdType.Greater]: {
    name: 'greater than',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) &&
      `${lambdaPrefix} (r["${data.field}"] > ${quoteStringValues(data.value)})`,
  },
  [ThresholdType.GreaterEqual]: {
    name: 'greater than or equal to',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) &&
      `${lambdaPrefix} (r["${data.field}"] >= ${quoteStringValues(
        data.value
      )})`,
  },
  [ThresholdType.Less]: {
    name: 'less than',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) &&
      `${lambdaPrefix} (r["${data.field}"] < ${quoteStringValues(data.value)})`,
  },
  [ThresholdType.LessEqual]: {
    name: 'less than or equal to',
    format: ThresholdFormat.Value,
    condition: data =>
      validateThreshold(data) &&
      `${lambdaPrefix} (r["${data.field}"] <= ${quoteStringValues(
        data.value
      )})`,
  },
  [ThresholdType.Between]: {
    name: 'between',
    format: ThresholdFormat.Range,
    condition: data =>
      validateThreshold(data) &&
      `${lambdaPrefix} (r["${data.field}"] > ${quoteStringValues(
        data.min
      )} and r["${data.field}"] < ${quoteStringValues(data.max)})`,
  },
  [ThresholdType.NotBetween]: {
    name: 'not between',
    format: ThresholdFormat.Range,
    condition: data =>
      validateThreshold(data) &&
      `${lambdaPrefix} (r["${data.field}"] < ${quoteStringValues(
        data.min
      )} or r["${data.field}"] > ${quoteStringValues(data.max)})`,
  },
}

export const deadmanType = ThresholdType.Deadman

export const THRESHOLD_TYPES = {
  ...COMMON_THRESHOLD_TYPES,
  [deadmanType]: {
    name: 'missing for longer than',
    format: ThresholdFormat.Deadman,
    condition: data => validateThreshold(data) && `${lambdaPrefix} (r["dead"])`,
  },
}
