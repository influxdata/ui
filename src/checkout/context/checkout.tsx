// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {
  getPaymentForm,
  getSettingsNotifications,
  postCheckout,
} from 'src/client/unityRoutes'

// Constants
import {states} from 'src/billing/constants'
import {
  getBillingSettingsError,
  submitError,
} from 'src/shared/copy/notifications'
import {
  BALANCE_THRESHOLD_DEFAULT,
  EMPTY_ZUORA_PARAMS,
} from 'src/shared/constants'

// Types
import {CreditCardParams, RemoteDataState} from 'src/types'
import {getErrorMessage} from 'src/utils/api'
import {event} from 'src/cloud/utils/reporting'

// Thunks
import {getOrgCreationAllowancesThunk} from 'src/identity/allowances/actions/thunks'
import {getQuartzIdentityThunk} from 'src/identity/actions/thunks'

// Selectors
import {selectCurrentIdentity} from 'src/identity/selectors'
import {shouldGetCredit250Experience} from 'src/me/selectors'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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
  isPaygCreditActive: boolean
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
  isPaygCreditActive: false,
}

export const CheckoutContext =
  React.createContext<CheckoutContextType>(DEFAULT_CONTEXT)

export const CheckoutProvider: FC<Props> = React.memo(({children}) => {
  const dispatch = useDispatch()

  const {user} = useSelector(selectCurrentIdentity)

  const [zuoraParams, setZuoraParams] =
    useState<CreditCardParams>(EMPTY_ZUORA_PARAMS)
  const [isDirty, setIsDirty] = useState(false)
  const isCredit250ExperienceActive = useSelector(shouldGetCredit250Experience)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputs, setInputs] = useState<Inputs>({
    paymentMethodId: null,
    notifyEmail: user.email, // sets the default to the user's registered email
    balanceThreshold: BALANCE_THRESHOLD_DEFAULT, // set the default to the minimum balance threshold
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

      setZuoraParams(response.data)
    } catch (error) {
      // Ingest the error since the Zuora Form will return an error form based on the error returned
      console.error(error)
    }
  }, [])

  useEffect(() => {
    getZuoraParams()
  }, [getZuoraParams])

  const getBillingSettings = useCallback(async () => {
    try {
      const resp = await getSettingsNotifications({})
      if (resp.status === 404) {
        // We're injesting the 404 error here and leaving the default inputs since
        // Quartz's API returns a 404 for valid requests that don't have any data
        // Meaning, if a user hasn't filled out the notification settings, the
        // API response is expected to return a 404 even though the query was successful
        return
      }
      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }
      setInputs(prevInputs => ({
        ...prevInputs,
        balanceThreshold: resp.data.balanceThreshold,
        notifyEmail: resp.data.notifyEmail,
        shouldNotify: resp.data.isNotify,
      }))
    } catch (error) {
      const message = getErrorMessage(error)
      dispatch(notify(getBillingSettingsError(message)))
    }
  }, [dispatch])

  useEffect(() => {
    getBillingSettings()
    return () => {
      dispatch(getQuartzIdentityThunk())
    }
  }, [getBillingSettings]) // eslint-disable-line react-hooks/exhaustive-deps

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
      setInputs(prevInputs => ({
        ...prevInputs,
        [name]: value,
      }))
    },
    [isDirty, setInputs]
  )

  const handleSetError = (name: string, value: boolean): void => {
    setErrors({
      ...errors,
      [name]: value,
    })
  }

  const handleSetErrors = useCallback((errorFields: string[]): void => {
    const errObj = {}
    errorFields.forEach(fieldName => {
      errObj[fieldName] = true
    })
    setErrors(prevErrors => ({
      ...prevErrors,
      ...errObj,
    }))
  }, [])

  const getInvalidFields = useCallback(() => {
    const fields = {...inputs}

    const {shouldNotify} = inputs
    if (!shouldNotify) {
      fields.notifyEmail = user.email // sets the default to the user's registered email
      fields.balanceThreshold = BALANCE_THRESHOLD_DEFAULT // set the default to the minimum balance threshold
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
  }, [user.email, inputs])

  const handleFormValidation = (): number => {
    const errs = getInvalidFields()

    if (errs.length > 0) {
      const errorFields = errs?.flatMap(([err]) => err)

      handleSetErrors(errorFields)
    }

    return errs.length
  }

  const handleSubmit = useCallback(
    async (paymentMethodId: string) => {
      if (isDirty === false) {
        setIsDirty(true)
      }
      setIsSubmitting(true)

      // Check to see if the form is valid using the validate form
      const errs = getInvalidFields()

      if (errs.length !== 0) {
        const errorFields = errs?.flatMap(([err]) => err)

        setCheckoutStatus(RemoteDataState.Error)
        handleSetErrors(errorFields)
        setIsSubmitting(false)

        return
      }

      try {
        const formData = {
          ...inputs,
          subdivision:
            inputs.country === 'United States'
              ? inputs.usSubdivision
              : inputs.intlSubdivision,
          isNotify: inputs.shouldNotify,
        }

        delete formData.usSubdivision
        delete formData.intlSubdivision
        delete formData.shouldNotify

        const paymentInformation = {
          ...formData,
          paymentMethodId,
          isPaygCreditActive: isCredit250ExperienceActive,
        }
        const response = await postCheckout({data: paymentInformation})

        if (response.status !== 201) {
          throw new Error(response.data.message)
        }

        event('CheckoutSuccess', {
          creditApplied: String(isCredit250ExperienceActive),
        })
        setCheckoutStatus(RemoteDataState.Done)
      } catch (error) {
        console.error(error)

        dispatch(notify(submitError()))
      } finally {
        setIsSubmitting(false)
        // Refresh whether user is allowed to create new orgs after upgrading to PAYG.
        if (isFlagEnabled('createDeleteOrgs')) {
          dispatch(getOrgCreationAllowancesThunk())
        }
      }
    },
    [
      dispatch,
      getInvalidFields,
      handleSetErrors,
      inputs,
      isCredit250ExperienceActive,
      isDirty,
    ]
  )

  const history = useHistory()

  const handleCancelClick = () => {
    if (!!window?._abcr && isDirty) {
      window._abcr?.triggerAbandonedCart()
    }

    history.goBack()
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
        isPaygCreditActive: isCredit250ExperienceActive,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
})
