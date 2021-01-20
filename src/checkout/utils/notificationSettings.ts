import * as yup from 'yup'

export interface NotificationSettings {
  notifyEmail?: string
  balanceThreshold?: number
  shouldNotify: boolean
}

const requiredMessage = 'This is a required field'

export const minimumBalanceThreshold = 1

export const validationSchema: yup.ObjectSchema<NotificationSettings> = yup.object(
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

export const makeInitial = (notifyEmail: string): NotificationSettings => ({
  notifyEmail,
  balanceThreshold: 10,
  shouldNotify: true,
})
