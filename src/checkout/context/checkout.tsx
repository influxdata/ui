// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {getBillingNotificationSettings} from 'src/billing/api'

// Constants
import {states} from 'src/billing/constants'
import {CheckoutClient} from 'src/checkout/client/checkoutClient'
import {submitError} from 'src/shared/copy/notifications'

// Types
import {RemoteDataState} from 'src/types'
import {ZuoraParams} from 'src/types/billing'

export type Props = {
  children: JSX.Element
}

export type Inputs = {
  paymentMethodId: number
  notifyEmail: string
  balanceThreshold: number
  shouldNotify: boolean
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
  errors: object
  handleSetCheckoutStatus: (status: RemoteDataState) => void
  handleSetError: (name: string, value: boolean) => void
  handleSetInputs: (name: string, value: string | number | boolean) => void
  handleSubmit: () => void
  inputs: Inputs
  isSubmitting: boolean
  zuoraParams: ZuoraParams
}

export const DEFAULT_CONTEXT: CheckoutContextType = {
  checkoutStatus: RemoteDataState.NotStarted,
  completeCheckout: (_: string) => {},
  errors: {},
  handleSetCheckoutStatus: (_: RemoteDataState) => {},
  handleSetError: (_: string, __: boolean) => {},
  handleSetInputs: (_: string, __: string | number | boolean) => {},
  handleSubmit: () => {},
  inputs: {
    paymentMethodId: null,
    notifyEmail: '', // TODO(ariel): set notifyEmail by user's email
    balanceThreshold: 1,
    shouldNotify: false,
    street1: '',
    street2: '',
    city: '',
    country: 'United States',
    intlSubdivision: '',
    usSubdivision: states[0],
    postalCode: '',
  },
  isSubmitting: true,
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
  const dispatch = useDispatch()
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
    balanceThreshold: 1, // TODO(ariel): set balanceThreshold by user's data
    shouldNotify: true,
    street1: '',
    street2: '',
    city: '',
    country: 'United States',
    intlSubdivision: '',
    usSubdivision: states[0],
    postalCode: '',
  })

  const getBillingSettings = useCallback(
    async (fields = inputs) => {
      const resp = await getBillingNotificationSettings()
      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }
      setInputs({
        ...fields,
        balanceThreshold: resp.data.balanceThreshold,
        notifyEmail: resp.data.notifyEmail,
      })
    },
    [getBillingNotificationSettings]
  )

  useEffect(() => {
    getBillingSettings()
  }, [getBillingSettings])

  const [errors, setErrors] = useState({
    notifyEmail: false,
    balanceThreshold: false,
    city: false,
    country: false,
    usSubdivision: false,
    postalCode: false,
  })

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

  const handleSetError = (name: string, value: boolean): void => {
    setErrors({
      ...errors,
      [name]: value,
    })
  }

  const handleSetErrors = (errorFields: string[]): void => {
    const errObj = {}
    errorFields.forEach(fieldName => {
      errObj[fieldName] = true
    })
    setErrors({
      ...errors,
      ...errObj,
    })
  }

  const invalidFields = useCallback(() => {
    const fields = {...inputs}

    const {shouldNotify} = inputs
    if (!shouldNotify) {
      getBillingSettings(fields)
      /**
       *
       * fields.notifyEmail = default user email
       * fields.balanceThreshold = default balance threshold
       */
    }

    return Object.entries(fields).filter(([key, value]) => {
      if (shouldNotify && key === 'notifyEmail' && value === '') {
        return true
      }
      if (shouldNotify && key === 'balanceThreshold' && value === '') {
        return true
      }
      if (
        key === 'usSubdivision' &&
        fields.country === 'United States' &&
        value === ''
      ) {
        return true
      }
      if (
        key === 'postalCode' &&
        fields.country === 'United States' &&
        value === ''
      ) {
        return true
      }
      if (key === 'city' && value === '') {
        return true
      }
      return false
    })
  }, [getBillingSettings, inputs])

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Check to see if the form is valid using the validate form
    const errs = invalidFields()
    try {
      if (errs.length === 0) {
        // Z.submit where Z is the Zuora Client IF the form is valid
        // TODO(ariel): uncomment once the Zuora client is defined
        // Z.submit()
      } else {
        console.log({errs})
        const errorFields = errs?.flatMap(([err]) => err)
        handleSetErrors(errorFields)
      }
    } catch (error) {
      console.error({error})
      dispatch(notify(submitError()))
    }
    setIsSubmitting(false)
  }

  return (
    <CheckoutContext.Provider
      value={{
        checkoutStatus,
        completeCheckout,
        errors,
        handleSetCheckoutStatus,
        handleSetError,
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
