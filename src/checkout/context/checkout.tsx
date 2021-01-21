// Libraries
import React, {FC, useCallback, useState} from 'react'

// Types
import {RemoteDataState} from 'src/types'

// Constants
import {states} from 'src/billing/constants'
import {CheckoutClient} from 'src/checkout/client/checkoutClient'

// Types
import {ZuoraParams} from 'src/types/billing'

export type Props = {
  children: JSX.Element
}

export type Inputs = {
  paymentMethodId: number
  notifyEmail: string
  balanceThreshold: number
  shouldNotify: true
  street1: string
  street2: string
  city: string
  country: string
  intlSubdivision: string
  usSubdivision: string
  postalCode: string
}

export interface CheckoutContextType {
  checkoutStatus: RemoteDataState
  completeCheckout: (value: string) => void
  handleSetCheckoutStatus: (status: RemoteDataState) => void
  handleSetInputs: (name: string, value: string | number | boolean) => void
  handleSubmit: () => void
  inputs: Inputs
  isSubmitting: boolean
  zuoraParams: ZuoraParams
}

export const DEFAULT_CONTEXT: CheckoutContextType = {
  checkoutStatus: RemoteDataState.NotStarted,
  completeCheckout: (_: string) => {},
  handleSetCheckoutStatus: (_: RemoteDataState) => {},
  handleSetInputs: (_: string, __: string | number | boolean) => {},
  handleSubmit: () => {},
  inputs: {
    paymentMethodId: null,
    notifyEmail: '', // TODO(ariel): set notifyEmail by user's email
    balanceThreshold: 0,
    shouldNotify: true,
    street1: '',
    street2: '',
    city: '',
    country: 'United States',
    intlSubdivision: '',
    usSubdivision: states[0],
    postalCode: '',
  },
  isSubmitting: false,
  zuoraParams: {
    id: '',
    tenantID: '',
    key: '',
    signature: '',
    token: '',
    style: '',
    submitEnabled: 'false',
    url: '',
  },
}

export const CheckoutContext = React.createContext<CheckoutContextType>(
  DEFAULT_CONTEXT
)

export const CheckoutProvider: FC<Props> = React.memo(({children}) => {
  const checkoutClient = new CheckoutClient()

  const zuoraParams: ZuoraParams = {
    id: 'zuora-id',
    tenantID: 'tenant-id',
    key: 'key',
    signature: 'signature',
    token: 'token',
    style: 'style',
    submitEnabled: 'true',
    url: 'url',
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputs, setInputs] = useState<Inputs>({
    paymentMethodId: null,
    notifyEmail: '', // TODO(ariel): set notifyEmail by user's email
    balanceThreshold: 0,
    shouldNotify: true,
    street1: '',
    street2: '',
    city: '',
    country: 'United States',
    intlSubdivision: '',
    usSubdivision: states[0],
    postalCode: '',
  })

  const [errors, setErrors] = useState({
    notifyEmail: false, // TODO(ariel): set notifyEmail by user's email
    balanceThreshold: false,
    paymentMethodId: false,
    street1: false,
    street2: false,
    city: false,
    country: false,
    intlSubdivision: false,
    usSubdivision: false,
    postalCode: false,
  })

  // TODO(ariel): error states
  const [checkoutStatus, setCheckoutStatus] = useState(
    RemoteDataState.NotStarted
  )

  const completeCheckout = useCallback(async () => {
    setCheckoutStatus(await checkoutClient.completePurchase(inputs))
  }, [checkoutClient, setCheckoutStatus, inputs])

  const handleSetInputs = useCallback(
    (name: string, value: string | number | boolean) => {
      setInputs({
        ...inputs,
        [name]: value,
      })
    },
    [inputs, setInputs]
  )

  const handleSetCheckoutStatus = useCallback(
    (status: RemoteDataState) => {
      setCheckoutStatus(status)
    },
    [setCheckoutStatus]
  )

  /**
   *
   *   // async function resetNotificationSettingsIfDisabled() {
  //   // Solve for the edge case where a user enables settings,
  //   // deletes the values in the name and threshold fields,
  //   // disables settings, and then submits the form.

  //   if (!values.shouldNotify) {
  //     await resetIfEmpty('notifyEmail')
  //     await resetIfEmpty('balanceThreshold')
  //   }
  // }

  // const validateQuartzForms = async (): Promise<boolean> => {
  //   await resetNotificationSettingsIfDisabled()

  //   const errors = await validateForm()

  //   if (Object.keys(errors).length === 0) {
  //     return true
  //   } else {
  //     // Touch all error fields on submit so we show the message
  //     // https://github.com/formium/formik/issues/2734#issuecomment-690810715
  //     return false
  //   }
  // }
   */
  const validateForm = useCallback(() => {
    console.log({inputs})
    /**
     * This function should:
     * 1. Check the inputs for any invalid fields
     *   a. Form validation should mimic what is currently happening in Quartz since it's pretty conditional based on certain selections
     * 2. Render relevant error messages for the fields that are invalid
     * 3. Return true/false if there are/aren't errors
     */
  }, [inputs])

  const handleSubmit = useCallback(() => {
    /**
     * this function should:
     * 1. Check to see if the form is valid using the validate form
     * 2. Z.submit where Z is the Zuora Client IF the form is valid
     */
    setIsSubmitting(true)
    // if ()
    // TODO(ariel): uncomment once the Zuora client is defined
    // Z.submit()
    setIsSubmitting(false)
  }, [])

  return (
    <CheckoutContext.Provider
      value={{
        checkoutStatus,
        completeCheckout,
        handleSetCheckoutStatus,
        handleSetInputs,
        handleSubmit,
        inputs,
        isSubmitting,
        zuoraParams,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
})

export default CheckoutProvider
