// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {Contact} from 'src/checkout/utils/contact'
import {
  getBillingInvoices,
  getMarketplace,
  getPaymentForm,
  getSettingsNotifications,
  putSettingsNotifications,
  postCheckout,
} from 'src/client/unityRoutes'
import {getQuartzMe} from 'src/me/selectors'
import {getQuartzMe as getQuartzMeThunk} from 'src/me/actions/thunks'

// Constants
import {states} from 'src/billing/constants'
import {submitError} from 'src/shared/copy/notifications'

// Types
import {
  BillingNotifySettings,
  Invoices,
  Marketplace,
  RemoteDataState,
} from 'src/types'
import {CreditCardParams} from 'src/types/billing'
import {getErrorMessage} from 'src/utils/api'

export type Props = {
  children: JSX.Element
}

export type Inputs = {
  paymentMethodId: string
  street1: string
  street2: string
  city: string
  country: string
  intlSubdivision: string
  usSubdivision: string
  postalCode: string
}

export interface BillingContextType {
  billingSettings: BillingNotifySettings
  billingSettingsStatus: RemoteDataState
  errors: object
  handleCancelClick: () => void
  handleGetBillingSettings: () => void
  handleGetInvoices: () => void
  handleGetMarketplace: () => void
  handleUpdateBillingSettings: (settings: BillingNotifySettings) => void
  handleSetError: (name: string, value: boolean) => void
  handleSetInputs: (name: string, value: string | number | boolean) => void
  handleSubmit: (paymentMethodId: string) => void
  handleFormValidation: () => number
  invoices: Invoices
  invoicesStatus: RemoteDataState
  marketplace: Marketplace
  marketplaceStatus: RemoteDataState
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

export const DEFAULT_CONTEXT: BillingContextType = {
  billingSettings: {
    notifyEmail: '',
    balanceThreshold: 1,
    isNotify: true,
  },
  billingSettingsStatus: RemoteDataState.NotStarted,
  errors: {},
  handleCancelClick: () => {},
  handleGetBillingSettings: () => {},
  handleGetInvoices: () => {},
  handleGetMarketplace: () => {},
  handleUpdateBillingSettings: (_settings: BillingNotifySettings) => {},
  handleSetError: (_: string, __: boolean) => {},
  handleSetInputs: (_: string, __: string | number | boolean) => {},
  handleSubmit: (_: string) => {},
  handleFormValidation: () => 0,
  invoices: [],
  invoicesStatus: RemoteDataState.NotStarted,
  marketplace: null,
  marketplaceStatus: RemoteDataState.NotStarted,
  inputs: null,
  isDirty: false,
  isSubmitting: false,
  setIsDirty: (_: boolean) => {},
  zuoraParams: EMPTY_ZUORA_PARAMS,
}

export const BillingContext = React.createContext<BillingContextType>(
  DEFAULT_CONTEXT
)

interface CheckoutBase {
  paymentMethodId?: string
}

export type Checkout = CheckoutBase & Contact

export const BillingProvider: FC<Props> = React.memo(({children}) => {
  const dispatch = useDispatch()

  const [zuoraParams, setZuoraParams] = useState<CreditCardParams>(
    EMPTY_ZUORA_PARAMS
  )
  const [isDirty, setIsDirty] = useState(false)

  const me = useSelector(getQuartzMe)
  const [billingSettings, setBillingSettings] = useState({
    notifyEmail: me?.email ?? '', // sets the default to the user's registered email
    balanceThreshold: 1, // set the default to the minimum balance threshold
    isNotify: true,
  })
  const [billingSettingsStatus, setBillingSettingsStatus] = useState(
    RemoteDataState.NotStarted
  )

  const [invoices, setInvoices] = useState([])
  const [invoicesStatus, setInvoicesStatus] = useState(
    RemoteDataState.NotStarted
  )

  const [marketplace, setMarketplace] = useState(null)
  const [marketplaceStatus, setMarketplaceStatus] = useState(
    RemoteDataState.NotStarted
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputs, setInputs] = useState<Inputs>({
    paymentMethodId: null,
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
      // Ingest the error since the Zuora Form will return an error form based on the error returned
      console.error(error)
    }
  }, [])

  useEffect(() => {
    getZuoraParams()
  }, [getZuoraParams])

  const handleGetInvoices = useCallback(async () => {
    try {
      setInvoicesStatus(RemoteDataState.Loading)
      const resp = await getBillingInvoices({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setInvoices(resp.data)
      setInvoicesStatus(RemoteDataState.Done)
    } catch (error) {
      // TODO(ariel): notify the users that something is wrong
      console.error(error)
      setInvoicesStatus(RemoteDataState.Error)
    }
  }, [])

  const handleGetMarketplace = useCallback(async () => {
    try {
      setMarketplaceStatus(RemoteDataState.Loading)
      const resp = await getMarketplace({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setMarketplace(resp.data)
      setMarketplaceStatus(RemoteDataState.Done)
    } catch (error) {
      // TODO(ariel): notify the users that something is wrong
      console.error(error)
      setMarketplaceStatus(RemoteDataState.Error)
    }
  }, [])

  const handleGetBillingSettings = useCallback(async () => {
    try {
      setBillingSettingsStatus(RemoteDataState.Loading)
      const resp = await getSettingsNotifications({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setBillingSettings(resp.data)
    } catch (error) {
      // We're injesting the error here and leaving the default inputs since
      // Quartz's API returns a 404 for valid requests that don't have any data
      // Meaning, if a user hasn't filled out the notification settings, the
      // API response is expected to return a 404 even though the query was successful
      console.error(error)
    } finally {
      setBillingSettingsStatus(RemoteDataState.Done)
    }
  }, [])

  const handleUpdateBillingSettings = useCallback(
    async (settings: BillingNotifySettings) => {
      try {
        setBillingSettingsStatus(RemoteDataState.Loading)
        const resp = await putSettingsNotifications({data: settings})

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        setBillingSettings({
          balanceThreshold: resp.data.balanceThreshold,
          notifyEmail: resp.data.notifyEmail,
          isNotify: resp.data.isNotify,
        })
      } catch (error) {
        // We're injesting the error here and leaving the default inputs since
        // Quartz's API returns a 404 for valid requests that don't have any data
        // Meaning, if a user hasn't filled out the notification settings, the
        // API response is expected to return a 404 even though the query was successful
        console.error(error)
      } finally {
        setBillingSettingsStatus(RemoteDataState.Done)
      }
    },
    []
  )

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

  const history = useHistory()

  const handleCancelClick = () => {
    if (!!window?._abcr && isDirty) {
      window._abcr?.triggerAbandonedCart()
    }

    history.goBack()
  }

  return (
    <BillingContext.Provider
      value={{
        billingSettings,
        billingSettingsStatus,
        errors,
        handleCancelClick,
        handleGetBillingSettings,
        handleGetInvoices,
        handleGetMarketplace,
        handleUpdateBillingSettings,
        handleSetError,
        handleSetInputs,
        invoices,
        invoicesStatus,
        marketplace,
        marketplaceStatus,
        inputs,
        isDirty,
        isSubmitting,
        setIsDirty,
        zuoraParams,
      }}
    >
      {children}
    </BillingContext.Provider>
  )
})

export default BillingProvider
