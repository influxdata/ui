import * as yup from 'yup'
import {
  BackendContact,
  Contact,
  makeInitial as makeInitialContact,
  isUS,
} from 'src/checkout/utils/contact'
import {
  NotificationSettings,
  makeInitial as makeInitialNotificationSettings,
} from 'src/checkout/utils/notificationSettings'

const requiredMessage = 'This is a required field'

export const minimumBalanceThreshold = 1

export const notificationSettingsSchema: yup.ObjectSchema<NotificationSettings> = yup.object(
  {
    shouldNotify: yup.boolean().required(requiredMessage),
    notifyEmail: yup.string().required(requiredMessage),
    balanceThreshold: yup
      .number()
      .min(minimumBalanceThreshold, 'Please enter a value of ${min} or greater')
      .required(requiredMessage)
      .transform(value => (isNaN(value) ? undefined : value)),
  }
)

export const contactSchema: yup.ObjectSchema<Contact> = yup.object({
  street1: yup.string(),
  street2: yup.string(),
  city: yup.string().required(requiredMessage),
  country: yup.string().required(requiredMessage),
  intlSubdivision: yup.string().notRequired(),
  usSubdivision: yup.string().when('country', {
    is: isUS,
    then: yup.string().required(requiredMessage),
    otherwise: yup.string().notRequired(),
  }),
  postalCode: yup.string().when('country', {
    is: isUS,
    then: yup.string().required(requiredMessage),
    otherwise: yup.string().notRequired(),
  }),
})

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
