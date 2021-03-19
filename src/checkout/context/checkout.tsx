// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {
  getCheckoutZuoraParams,
  getBillingNotificationSettings,
  postCheckoutInformation,
  makeCheckoutPayload,
} from 'src/billing/api'
import {Contact} from 'src/checkout/utils/contact'

// Constants
import {states} from 'src/billing/constants'
import {submitError} from 'src/shared/copy/notifications'

// Types
import {RemoteDataState} from 'src/types'
import {ZuoraParams, BillingNotifySettings} from 'src/types/billing'

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
  onSuccessUrl: string
  handleSetCheckoutStatus: (status: RemoteDataState) => void
  handleSetError: (name: string, value: boolean) => void
  handleSetInputs: (name: string, value: string | number | boolean) => void
  handleSubmit: (paymentMethodId: string) => void
  handleFormValidation: () => number
  inputs: Inputs
  isSubmitting: boolean
  zuoraParams: ZuoraParams
}

export const DEFAULT_CONTEXT: CheckoutContextType = {
  checkoutStatus: RemoteDataState.NotStarted,
  errors: {},
  onSuccessUrl: '',
  handleSetCheckoutStatus: (_: RemoteDataState) => {},
  handleSetError: (_: string, __: boolean) => {},
  handleSetInputs: (_: string, __: string | number | boolean) => {},
  handleSubmit: (_: string) => {},
  handleFormValidation: () => 0,
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
  isSubmitting: false,
  zuoraParams: {
    id: '',
    tenantId: '',
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

interface CheckoutBase {
  paymentMethodId?: string
}

export type Checkout = CheckoutBase & BillingNotifySettings & Contact

export const CheckoutProvider: FC<Props> = React.memo(({children}) => {
  const dispatch = useDispatch()

  const [zuoraParams, setZuoraParams] = useState({} as ZuoraParams)

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

  const getZuoraParams = useCallback(async () => {
    const response = await getCheckoutZuoraParams()
    if (response.status !== 200) {
      throw new Error(response.data.message)
    }

    setZuoraParams(response.data)
  }, [getCheckoutZuoraParams])

  useEffect(() => {
    getZuoraParams()
  }, [getZuoraParams])

  const [onSuccessUrl, setOnSuccessUrl] = useState<string>('')

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

      RemoteDataState.Done === status && setOnSuccessUrl(zuoraParams.url)
    },
    [setCheckoutStatus, zuoraParams]
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

  const handleFormValidation = (): number => {
    const errs = getInvalidFields()

    if (errs.length > 0) {
      const errorFields = errs?.flatMap(([err]) => err)

      handleSetErrors(errorFields)
    }

    return errs.length
  }

  const handleSubmit = async (paymentMethodId: string) => {
    setIsSubmitting(true)

    // Check to see if the form is valid using the validate form
    const errs = getInvalidFields()

    try {
      if (errs.length === 0) {
        const data = {...inputs, paymentMethodId}
        const paymentInformation = makeCheckoutPayload(data) as Checkout

        const response = await postCheckoutInformation(paymentInformation)

        handleSetCheckoutStatus(
          response.status === 201 ? RemoteDataState.Done : RemoteDataState.Error
        )
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

  return (
    <CheckoutContext.Provider
      value={{
        checkoutStatus,
        errors,
        handleSetCheckoutStatus,
        handleSetError,
        handleSetInputs,
        handleSubmit,
        handleFormValidation,
        inputs,
        isSubmitting,
        zuoraParams,
        onSuccessUrl,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
})

export default CheckoutProvider
