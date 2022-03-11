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

export const sanitizeForm = (form: Subscription): Subscription => {
  if (form.brokerPassword === '' || form.brokerUsername === '') {
    delete form.brokerUsername
    delete form.brokerPassword
  }
  return form
}
