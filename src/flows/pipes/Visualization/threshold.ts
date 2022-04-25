export enum ThresholdFormat {
  Value = 'value',
  Range = 'range',
  Deadman = 'deadman',
}

export type Threshold = {
  value: number
  type: string
  field: string
  max?: number
  min?: number
  deadmanCheckValue?: string
  deadmanStopValue: string
}

export interface ErrorThreshold extends Threshold {
  fieldType: string
}

export const lambdaPrefix = '(r) =>'

export const EQUALITY_THRESHOLD_TYPES = {
  equal: {
    name: 'equal to',
    format: ThresholdFormat.Value,
    condition: data => `${lambdaPrefix} (r["${data.field}"] == ${data.value})`,
  },
  'not-equal': {
    name: 'not equal to',
    format: ThresholdFormat.Value,
    condition: data => `${lambdaPrefix} (r["${data.field}"] != ${data.value})`,
  },
}

export const COMMON_THRESHOLD_TYPES = {
  ...EQUALITY_THRESHOLD_TYPES,
  greater: {
    name: 'greater than',
    format: ThresholdFormat.Value,
    condition: data => `${lambdaPrefix} (r["${data.field}"] > ${data.value})`,
  },
  'greater-equal': {
    name: 'greater than or equal to',
    format: ThresholdFormat.Value,
    condition: data => `${lambdaPrefix} (r["${data.field}"] >= ${data.value})`,
  },
  less: {
    name: 'less than',
    format: ThresholdFormat.Value,
    condition: data => `${lambdaPrefix} (r["${data.field}"] < ${data.value})`,
  },
  'less-equal': {
    name: 'less than or equal to',
    format: ThresholdFormat.Value,
    condition: data => `${lambdaPrefix} (r["${data.field}"] <= ${data.value})`,
  },
  between: {
    name: 'between',
    format: ThresholdFormat.Range,
    condition: data =>
      `${lambdaPrefix} (r["${data.field}"] > ${data.min} and r["${data.field}"] < ${data.max})`,
  },
  'not-between': {
    name: 'not between',
    format: ThresholdFormat.Range,
    condition: data =>
      `${lambdaPrefix} (r["${data.field}"] < ${data.min} or r["${data.field}"] > ${data.max})`,
  },
}

export const deadmanType = 'missing-for-longer-than'

export const THRESHOLD_TYPES = {
  ...COMMON_THRESHOLD_TYPES,
  [deadmanType]: {
    name: 'missing for longer than',
    format: ThresholdFormat.Deadman,
    condition: _ => `${lambdaPrefix} (r["dead"])`,
  },
}
