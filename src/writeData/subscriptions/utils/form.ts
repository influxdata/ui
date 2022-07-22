import {
  Subscription,
  StringObjectParams,
  JsonSpec,
  StepsStatus,
  Steps,
  SubscriptionNavigationModel,
} from 'src/types/subscriptions'
import jsonpath from 'jsonpath'
import {IconFont} from '@influxdata/clockface'

export const DEFAULT_COMPLETED_STEPS = {
  [Steps.BrokerForm]: false,
  [Steps.SubscriptionForm]: false,
  [Steps.ParsingForm]: false,
}

export const DEFAULT_STEPS_STATUS = {
  currentStep: Steps.BrokerForm,
  clickedStep: Steps.BrokerForm,
  brokerStepCompleted: 'false',
  subscriptionStepCompleted: 'false',
  parsingStepCompleted: 'false',
  dataFormat: 'not chosen yet',
}

export const SUBSCRIPTION_NAVIGATION_STEPS: SubscriptionNavigationModel[] = [
  {
    glyph: IconFont.UploadOutline,
    name: 'Connect \n to Broker',
    type: Steps.BrokerForm,
    isComplete: false,
  },
  {
    glyph: IconFont.Subscribe,
    name: 'Subscribe \n to Topic',
    type: Steps.SubscriptionForm,
    isComplete: false,
  },
  {
    glyph: IconFont.Braces,
    name: 'Define Data \n Parsing Rules',
    type: Steps.ParsingForm,
    isComplete: false,
  },
]

export const REGEX_TOOLTIP =
  'Java flavor regular expressions expected. Use a capture group if desired. See https://regex101.com for more info.'
export const JSON_TOOLTIP =
  'JsonPath expression that returns a singular value expected. See http://jsonpath.com for more info.'

export const handleValidation = (
  property: string,
  formVal: string
): string | null => {
  if (!formVal) {
    return `${property} is required`
  }
  return null
}

export const handleJsonPathValidation = (formVal: string): string | null => {
  if (!validateJsonPath(formVal)) {
    return `${formVal} is not a valid JSON Path expression`
  }
}

export const handleRegexValidation = (formVal: string): string | null => {
  if (!validateRegex(formVal)) {
    return `${formVal} is not a valid Regular Expression`
  }
}

export const checkJSONPathStarts$ = (firstChar, formVal): string | null => {
  if (firstChar !== '$') {
    return formVal.replace(/^/, '$.')
  }
  return null
}

export const sanitizeForm = (form: Subscription): Subscription => {
  // add $. if not at start of input for json paths
  if (form.jsonMeasurementKey.path) {
    const startChar = form.jsonMeasurementKey?.path.charAt(0) ?? ''
    const newVal = checkJSONPathStarts$(startChar, form.jsonMeasurementKey.path)
    if (newVal) {
      form.jsonMeasurementKey.path = newVal
    }
  }
  if (form.jsonMeasurementKey.type === 'integer') {
    form.jsonMeasurementKey.type = 'int'
  }

  if (form.jsonFieldKeys) {
    form.jsonFieldKeys.map(f => {
      const startChar = f.path?.charAt(0) ?? ''
      const newVal = checkJSONPathStarts$(startChar, f.path)
      if (newVal) {
        f.path = newVal
      }
      if (f.type === 'integer') {
        f.type = 'int'
      }
    })
  }
  if (form.jsonTagKeys) {
    form.jsonTagKeys.map(t => {
      const startChar = t.path?.charAt(0) ?? ''
      const newVal = checkJSONPathStarts$(startChar, t.path)
      if (newVal) {
        t.path = newVal
      }
      if (t.type === 'integer') {
        t.type = 'int'
      }
    })
  }
  if (form.jsonTimestamp?.path) {
    const startChar = form.jsonTimestamp.path.charAt(0)
    const newVal = checkJSONPathStarts$(startChar, form.jsonTimestamp.path)
    if (newVal) {
      form.jsonTimestamp.path = newVal
    }
  }

  if (form.brokerPassword === '' || form.brokerUsername === '') {
    delete form.brokerPassword
  }
  return form
}

export const sanitizeUpdateForm = (form: Subscription): Subscription => {
  if (form.jsonMeasurementKey.path) {
    const startChar = form.jsonMeasurementKey?.path.charAt(0) ?? ''
    const newVal = checkJSONPathStarts$(startChar, form.jsonMeasurementKey.path)
    if (newVal) {
      form.jsonMeasurementKey.path = newVal
    }
  }
  if (form.jsonMeasurementKey.type === 'integer') {
    form.jsonMeasurementKey.type = 'int'
  }
  if (form.jsonFieldKeys) {
    form.jsonFieldKeys.map(f => {
      const startChar = f.path?.charAt(0) ?? ''
      const newVal = checkJSONPathStarts$(startChar, f.path)
      if (newVal) {
        f.path = newVal
      }
      if (f.type === 'integer') {
        f.type = 'int'
      }
    })
  }
  if (form.jsonTagKeys) {
    form.jsonTagKeys.map(t => {
      const startChar = t.path?.charAt(0) ?? ''
      const newVal = checkJSONPathStarts$(startChar, t.path)
      if (newVal) {
        t.path = newVal
      }
      if (t.type === 'integer') {
        t.type = 'int'
      }
    })
  }
  if (form.jsonTimestamp?.path) {
    const startChar = form.jsonTimestamp.path.charAt(0)
    const newVal = checkJSONPathStarts$(startChar, form.jsonTimestamp.path)
    if (newVal) {
      form.jsonTimestamp.path = newVal
    }
    if (!form.jsonTimestamp?.name) {
      form.jsonTimestamp.name = 'timestamp'
    }
    if (!form.jsonTimestamp?.type) {
      form.jsonTimestamp.type = 'string'
    }
  }

  delete form.id
  delete form.orgID
  delete form.processGroupID
  delete form.createdAt
  delete form.updatedAt
  delete form.createdBy
  delete form.updatedBy
  delete form.tokenID
  delete form.isActive
  delete form.status
  delete form.flowVersion
  return form
}

export const sanitizeType = (type: string): string => {
  if (type === 'double') {
    type = 'Float'
  }
  if (type === 'int') {
    type = 'Integer'
  }
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export const checkRequiredFields = (form: Subscription): boolean =>
  form.name &&
  form.protocol &&
  form.brokerHost &&
  form.brokerPort &&
  form.topic &&
  form.dataFormat &&
  form.bucket &&
  checkRequiredStringFields(form) &&
  checkRequiredJsonFields(form)

export const checkRequiredStringFields = (form: Subscription): boolean => {
  if (form.dataFormat !== 'string') {
    return true
  }
  return (
    checkStringMeasurement(form.stringMeasurement) &&
    checkStringTimestamp(form.stringTimestamp) &&
    form.stringFields?.length > 0 &&
    form.stringFields?.every(f => checkStringObjRequiredFields(f)) &&
    form.stringTags?.every(t => checkStringObjRequiredFields(t))
  )
}

const checkStringMeasurement = (stringMeasurement: StringObjectParams) => {
  return (
    !!stringMeasurement.name ||
    (!!stringMeasurement.pattern && validateRegex(stringMeasurement.pattern))
  )
}

const checkStringObjRequiredFields = (
  stringObjParams: StringObjectParams
): boolean =>
  !!stringObjParams.pattern &&
  !!stringObjParams.name &&
  validateRegex(stringObjParams?.pattern)

const checkStringTimestamp = (stringObjParams: StringObjectParams): boolean => {
  if (!stringObjParams.pattern) {
    return true
  }
  return validateRegex(stringObjParams.pattern)
}

const validateRegex = (regex: string): boolean => {
  try {
    new RegExp(regex)
    return true
  } catch {
    return false
  }
}

const checkJsonObjRequiredFields = (jsonObjParams: JsonSpec): boolean =>
  !!jsonObjParams.name &&
  !!jsonObjParams.path &&
  !!jsonObjParams.type &&
  validateJsonPath(jsonObjParams.path)

const checkJsonTimestamp = (jsonObjParams: JsonSpec): boolean => {
  if (!jsonObjParams.path) {
    return true
  }
  return validateJsonPath(jsonObjParams.path)
}

export const checkRequiredJsonFields = (form: Subscription): boolean => {
  if (form.dataFormat !== 'json') {
    return true
  }
  return (
    checkJsonMeasurement(form.jsonMeasurementKey) &&
    checkJsonTimestamp(form.jsonTimestamp) &&
    form.jsonFieldKeys?.length > 0 &&
    form.jsonFieldKeys?.every(f => checkJsonObjRequiredFields(f)) &&
    form.jsonTagKeys?.every(t => checkJsonObjRequiredFields(t))
  )
}

const checkJsonMeasurement = (jsonMeasurement: JsonSpec) => {
  return (
    !!jsonMeasurement.type &&
    (!!jsonMeasurement.name ||
      (!!jsonMeasurement.path && validateJsonPath(jsonMeasurement.path)))
  )
}

const validateJsonPath = (path: string): boolean => {
  try {
    jsonpath.parse(path)
    return true
  } catch {
    return false
  }
}

export const getActiveStep = activeForm => {
  let currentStep = 1

  SUBSCRIPTION_NAVIGATION_STEPS.forEach((step, index) => {
    if (step.type === activeForm) {
      currentStep = index + 1
    }
  })

  return currentStep
}

export const getFormStatus = (active: Steps, form: Subscription) => {
  return {
    currentStep: active,
    clickedStep: SUBSCRIPTION_NAVIGATION_STEPS[getActiveStep(active) - 1].type,
    brokerStepCompleted:
      form.name && form.brokerHost && form.brokerPort ? 'true' : 'false',
    subscriptionStepCompleted:
      form.topic && form.bucket && form.bucket !== '<BUCKET>'
        ? 'true'
        : 'false',
    parsingStepCompleted:
      form.dataFormat &&
      checkRequiredJsonFields(form) &&
      checkRequiredStringFields(form)
        ? 'true'
        : 'false',
    dataFormat: form.dataFormat ?? 'not chosen yet',
  } as StepsStatus
}
