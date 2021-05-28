// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {Contact} from 'src/checkout/utils/contact'
import {
  getBilling,
  getBillingInvoices,
  getMarketplace,
  getPaymentForm,
  getSettingsNotifications,
  putBillingPaymentMethod,
  putSettingsNotifications,
} from 'src/client/unityRoutes'
import {getQuartzMe} from 'src/me/selectors'

// Types
import {
  BillingContact,
  BillingInfo,
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
  billingInfo: BillingInfo
  billingInfoStatus: RemoteDataState
  billingSettings: BillingNotifySettings
  billingSettingsStatus: RemoteDataState
  handleGetBillingInfo: () => void
  handleGetBillingSettings: () => void
  handleGetInvoices: () => void
  handleGetMarketplace: () => void
  handleGetZuoraParams: () => void
  handleUpdateBillingSettings: (settings: BillingNotifySettings) => void
  handleUpdatePaymentMethod: (id: string) => void
  invoices: Invoices
  invoicesStatus: RemoteDataState
  marketplace: Marketplace
  marketplaceStatus: RemoteDataState
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
}

export const DEFAULT_CONTEXT: BillingContextType = {
  billingInfo: null,
  billingInfoStatus: RemoteDataState.NotStarted,
  billingSettings: {
    notifyEmail: '',
    balanceThreshold: 1,
    isNotify: true,
  },
  billingSettingsStatus: RemoteDataState.NotStarted,
  handleGetBillingInfo: () => {},
  handleGetBillingSettings: () => {},
  handleGetInvoices: () => {},
  handleGetMarketplace: () => {},
  handleGetZuoraParams: () => {},
  handleUpdateBillingSettings: (_settings: BillingNotifySettings) => {},
  handleUpdatePaymentMethod: (_id: string) => {},
  invoices: [],
  invoicesStatus: RemoteDataState.NotStarted,
  marketplace: null,
  marketplaceStatus: RemoteDataState.NotStarted,
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

  const [billingInfo, setBillingInfo] = useState(null)
  const [billingInfoStatus, setBillingInfoStatus] = useState(
    RemoteDataState.NotStarted
  )

  const handleGetZuoraParams = useCallback(async () => {
    try {
      const response = await getPaymentForm({form: 'billing'})

      if (response.status !== 200) {
        throw new Error(getErrorMessage(response))
      }

      setZuoraParams(response.data)
    } catch (error) {
      // Ingest the error since the Zuora Form will return an error form based on the error returned
      console.error(error)
    }
  }, [])

  const handleUpdatePaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      try {
        const response = await putBillingPaymentMethod({data: paymentMethodId})

        if (response.status !== 200) {
          throw new Error(getErrorMessage(response))
        }

        // TODO(ariel): set the payment method of the billingInfo
        // setPaymentMethod(response.data)
      } catch (error) {
        // Ingest the error since the Zuora Form will return an error form based on the error returned
        console.error(error)
      }
    },
    []
  )

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

  const handleGetBillingInfo = useCallback(async () => {
    try {
      setBillingInfoStatus(RemoteDataState.Loading)
      const resp = await getBilling({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setBillingInfo(resp.data)
      setBillingInfoStatus(RemoteDataState.Done)
    } catch (error) {
      // TODO(ariel): notify the users that something is wrong
      console.error(error)
      setBillingInfoStatus(RemoteDataState.Error)
    }
  }, [])

  const handleUpdateBillingInfo = useCallback(
    async (contact: BillingContact) => {
      try {
        setBillingInfoStatus(RemoteDataState.Loading)
        // TODO(ariel): update the contact
        // const resp = await updateBillingContact({data: contact})
        const resp = await getBilling({})

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        // TODO(ariel): set the response to update the contact, not the entire billingInfo
        setBillingInfo(resp.data)
        setBillingInfoStatus(RemoteDataState.Done)
      } catch (error) {
        // TODO(ariel): notify the users that something is wrong
        console.error(error)
        setBillingInfoStatus(RemoteDataState.Error)
      }
    },
    []
  )

  // TODO(ariel): handleUpdateBillingInfo

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

  return (
    <BillingContext.Provider
      value={{
        billingInfo,
        billingInfoStatus,
        billingSettings,
        billingSettingsStatus,
        handleGetBillingInfo,
        handleGetBillingSettings,
        handleGetInvoices,
        handleGetMarketplace,
        handleGetZuoraParams,
        handleUpdateBillingSettings,
        handleUpdatePaymentMethod,
        invoices,
        invoicesStatus,
        marketplace,
        marketplaceStatus,
        zuoraParams,
      }}
    >
      {children}
    </BillingContext.Provider>
  )
})

export default BillingProvider
