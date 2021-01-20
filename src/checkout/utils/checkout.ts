import * as yup from 'yup'
import {
  BackendContact,
  Contact,
  makeInitial as makeInitialContact,
  isUS,
  validationSchema as contactSchema,
} from 'src/checkout/utils/contact'
import {
  NotificationSettings,
  makeInitial as makeInitialNotificationSettings,
  validationSchema as notificationSettingsSchema,
} from 'src/checkout/utils/notificationSettings'

interface CheckoutBase {
  paymentMethodId?: string
}

export type Checkout = CheckoutBase & NotificationSettings & Contact

export type BackendCheckout = CheckoutBase &
  NotificationSettings &
  BackendContact

export const validationSchema: yup.ObjectSchema<Checkout> = yup
  .object({
    paymentMethodId: yup.string().nullable(),
  })
  .concat(notificationSettingsSchema)
  .concat(contactSchema)

export const makeInitial = (email: string, states: string[]): Checkout => ({
  paymentMethodId: null,
  ...makeInitialNotificationSettings(email),
  ...makeInitialContact(states),
})

export const toBackend = (checkout: Checkout): BackendCheckout => {
  const {intlSubdivision, usSubdivision, ...values} = checkout

  const subdivision = isUS(values.country) ? usSubdivision : intlSubdivision

  return {
    ...values,
    subdivision,
  }
}
