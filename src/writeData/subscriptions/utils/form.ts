import {Subscription} from 'src/types/subscriptions'

export const handleValidation = (
  property: string,
  formVal: string
): string | null => {
  if (!formVal) {
    return `${property} is required`
  }
  return null
}

export const checkJSONPathStarts$ = (firstChar, formVal): string | null => {
  if (firstChar !== '$') {
    return formVal.replace(/^/, '$.')
  }
  return null
}

export const sanitizeForm = (form: Subscription): Subscription => {
  // add $. if not at start of input for json paths
  if (form.jsonMeasurementKey) {
    const startChar = form.jsonMeasurementKey?.path.charAt(0) ?? ''
    const newVal = checkJSONPathStarts$(startChar, form.jsonMeasurementKey.path)
    if (newVal) {
      form.jsonMeasurementKey.path = newVal
    }
    if (form.jsonMeasurementKey.type === 'number') {
      form.jsonMeasurementKey.type = 'double'
    }
  }
  if (form.jsonFieldKeys) {
    form.jsonFieldKeys.map(f => {
      const startChar = f.path?.charAt(0) ?? ''
      const newVal = checkJSONPathStarts$(startChar, f.path)
      if (newVal) {
        f.path = newVal
      }
      if (f.type === 'number') {
        f.type = 'double'
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
      if (t.type === 'number') {
        t.type = 'double'
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
  if (form.stringMeasurement) {
    form.stringMeasurement.pattern =
      form.stringMeasurement?.pattern.replace(/\\\\/g, '\\') ?? ''
  }
  if (form.stringFields) {
    form.stringFields.map(f => {
      f.pattern = f.pattern?.replace(/\\\\/g, '\\') ?? ''
    })
  }
  if (form.stringTags) {
    form.stringTags.map(t => {
      t.pattern = t.pattern?.replace(/\\\\/g, '\\') ?? ''
    })
  }
  if (form.brokerPassword === '' || form.brokerUsername === '') {
    delete form.brokerUsername
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
    if (form.jsonMeasurementKey.type === 'number') {
      form.jsonMeasurementKey.type = 'double'
    }
  }
  if (form.jsonFieldKeys) {
    form.jsonFieldKeys.map(f => {
      const startChar = f.path?.charAt(0) ?? ''
      const newVal = checkJSONPathStarts$(startChar, f.path)
      if (newVal) {
        f.path = newVal
      }
      if (f.type === 'number') {
        f.type = 'double'
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
      if (t.type === 'number') {
        t.type = 'double'
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
  delete form.id
  delete form.orgID
  delete form.processGroupID
  delete form.createdAt
  delete form.updatedAt
  delete form.tokenID
  delete form.isActive
  delete form.status
  return form
}

export const sanitizeType = (type: string): string => {
  if (type === 'double') {
    type = 'Number'
  }
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export const checkRequiredFields = (form: Subscription): boolean => {
  if (
    form.name &&
    form.protocol &&
    form.brokerHost &&
    form.brokerPort &&
    form.topic &&
    form.dataFormat &&
    form.bucket
  ) {
    return true
  } else {
    return false
  }
}
