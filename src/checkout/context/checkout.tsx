// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {Contact} from 'src/checkout/utils/contact'
import {
  getPaymentForm,
  getSettingsNotifications,
  postCheckout,
} from 'src/client/unityRoutes'

// Constants
import {states} from 'src/billing/constants'
import {submitError} from 'src/shared/copy/notifications'

// Types
import {RemoteDataState} from 'src/types'
import {BillingNotifySettings, CreditCardParams} from 'src/types/billing'
import {getErrorMessage} from 'src/utils/api'

export type Props = {
  children: JSX.Element
}

export type Inputs = {
  paymentMethodId: string
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
  errors: object
  handleCancelClick: () => void
  handleSetError: (name: string, value: boolean) => void
  handleSetInputs: (name: string, value: string | number | boolean) => void
  handleSubmit: (paymentMethodId: string) => void
  handleFormValidation: () => number
  inputs: Inputs
  isDirty: boolean
  isSubmitting: boolean
  setIsDirty: (_: boolean) => void
  zuoraParams: CreditCardParams
}

// If we don't initialize these params here, then the UI will start
// showing a popup and cypress tests will start failing.
const EMPTY_ZUORA_PARAMS: CreditCardParams = {
  id: '',
  tenantId: '',
  key: '',
  signature: '',
  token: '',
  style: '',
  submitEnabled: 'false',
  url: '',
  status: RemoteDataState.NotStarted,
}

export const DEFAULT_CONTEXT: CheckoutContextType = {
  checkoutStatus: RemoteDataState.NotStarted,
  errors: {},
  handleCancelClick: () => {},
  handleSetError: (_: string, __: boolean) => {},
  handleSetInputs: (_: string, __: string | number | boolean) => {},
  handleSubmit: (_: string) => {},
  handleFormValidation: () => 0,
  inputs: null,
  isDirty: false,
  isSubmitting: false,
  setIsDirty: (_: boolean) => {},
  zuoraParams: EMPTY_ZUORA_PARAMS,
}

export const CheckoutContext = React.createContext<CheckoutContextType>(
  DEFAULT_CONTEXT
)

interface CheckoutBase {
  paymentMethodId?: string
}

export type Checkout = CheckoutBase & BillingNotifySettings & Contact

export const CheckoutProvider: FC<Props> = React.memo(({children}) => {
  const dispatch = useDispatch()

  const [zuoraParams, setZuoraParams] = useState<CreditCardParams>(
    EMPTY_ZUORA_PARAMS
  )
  const [isDirty, setIsDirty] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputs, setInputs] = useState<Inputs>({
    paymentMethodId: null,
    notifyEmail: '',
    balanceThreshold: null,
    shouldNotify: true,
    street1: '',
    street2: '',
    city: '',
    country: 'United States',
    intlSubdivision: '',
    usSubdivision: states[0],
    postalCode: '',
  })

  const getZuoraParams = useCallback(async () => {
    try {
      const response = await getPaymentForm({form: 'checkout'})
      if (response.status !== 200) {
        throw new Error(getErrorMessage(response))
      }

      // TODO(ariel): remove type casting here when Billing is refactored and integrated
      setZuoraParams(response.data as CreditCardParams)
    } catch (error) {
      // TODO(ariel): should we notify or report the error?
      console.error(error)
    }
  }, [])

  useEffect(() => {
    getZuoraParams()
  }, [getZuoraParams])

  const getBillingSettings = useCallback(
    async (fields = inputs) => {
      try {
        const resp = await getSettingsNotifications({})
        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }
        setInputs({
          ...fields,
          balanceThreshold: resp.data.balanceThreshold,
          notifyEmail: resp.data.notifyEmail,
        })
      } catch (error) {
        // TODO(ariel): add failure notification
        console.error('error getting the settings: ', error)
      }
    },
    [getSettingsNotifications] // eslint-disable-line react-hooks/exhaustive-deps
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

  const handleSetInputs = useCallback(
    (name: string, value: string | number | boolean) => {
      if (isDirty === false) {
        setIsDirty(true)
      }
      setInputs({
        ...inputs,
        [name]: value,
      })
    },
    [inputs, setInputs] // eslint-disable-line react-hooks/exhaustive-deps
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

  const getInvalidFields = useCallback(() => {
    const fields = {...inputs}

    const {shouldNotify} = inputs
    if (!shouldNotify) {
      getBillingSettings(fields)
      /**
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

  const handleFormValidation = (): number => {
    const errs = getInvalidFields()

    if (errs.length > 0) {
      const errorFields = errs?.flatMap(([err]) => err)

      handleSetErrors(errorFields)
    }

    return errs.length
  }

  const handleSubmit = async (paymentMethodId: string) => {
    if (isDirty === false) {
      setIsDirty(true)
    }
    setIsSubmitting(true)

    // Check to see if the form is valid using the validate form
    const errs = getInvalidFields()

    try {
      if (errs.length === 0) {
        const paymentInformation = {...inputs, paymentMethodId}

        const response = await postCheckout({data: paymentInformation})

        setCheckoutStatus(
          response.status === 201 ? RemoteDataState.Done : RemoteDataState.Error
        )
        // TODO(ariel): make sure to refetch the `/me` endpoint after a user leaves the checkout
        // TODO(ariel): where should we redirect the user to once they've upgraded?
      } else {
        const errorFields = errs?.flatMap(([err]) => err)

        handleSetErrors(errorFields)
      }
    } catch (error) {
      console.error({error})

      dispatch(notify(submitError()))
    }

    setIsSubmitting(false)
  }

  const history = useHistory()

  const handleCancelClick = () => {
    if (!!window?._abcr && isDirty) {
      window._abcr?.triggerAbandonedCart()
    }

    history.push('/')
  }

  return (
    <CheckoutContext.Provider
      value={{
        checkoutStatus,
        errors,
        handleCancelClick,
        handleSetError,
        handleSetInputs,
        handleSubmit,
        handleFormValidation,
        inputs,
        isDirty,
        isSubmitting,
        setIsDirty,
        zuoraParams,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
})

export default CheckoutProvider
