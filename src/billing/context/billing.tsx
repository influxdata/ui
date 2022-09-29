// Libraries
import React, {FC, useCallback, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {
  getBilling,
  getBillingInvoices,
  getMarketplace,
  getPaymentForm,
  getSettingsNotifications,
  putBillingPaymentMethod,
  putSettingsNotifications,
  putBillingContact,
} from 'src/client/unityRoutes'
import {
  getBillingInfoError,
  getBillingSettingsError,
  getInvoicesError,
  getMarketplaceError,
  updateBillingInfoError,
  updateBillingSettingsError,
  updatePaymentMethodError,
} from 'src/shared/copy/notifications'

// Constants
import {
  BALANCE_THRESHOLD_DEFAULT,
  EMPTY_ZUORA_PARAMS,
} from 'src/shared/constants'
import {zuoraParamsGetFailure} from 'src/shared/copy/notifications'

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

// Selectors
import {selectCurrentIdentity} from 'src/identity/selectors'

export type Props = {
  children: JSX.Element
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
  handleUpdateBillingContact: (contact: BillingContact) => void
  handleUpdateBillingSettings: (settings: BillingNotifySettings) => void
  handleUpdatePaymentMethod: (id: string) => void
  invoices: Invoices
  invoicesStatus: RemoteDataState
  marketplace: Marketplace
  marketplaceStatus: RemoteDataState
  zuoraParams: CreditCardParams
  zuoraParamsStatus: RemoteDataState
}

const DEFAULT_BILLING_INFO = {
  balance: 0,
  balanceUpdatedAt: '',
  contact: {
    companyName: '',
    email: '',
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    postalCode: '',
  },
} as BillingInfo

export const DEFAULT_CONTEXT: BillingContextType = {
  billingInfo: DEFAULT_BILLING_INFO,
  billingInfoStatus: RemoteDataState.NotStarted,
  billingSettings: null,
  billingSettingsStatus: RemoteDataState.NotStarted,
  handleGetBillingInfo: () => {},
  handleGetBillingSettings: () => {},
  handleGetInvoices: () => {},
  handleGetMarketplace: () => {},
  handleGetZuoraParams: () => {},
  handleUpdateBillingContact: (_contact: BillingContact) => {},
  handleUpdateBillingSettings: (_settings: BillingNotifySettings) => {},
  handleUpdatePaymentMethod: (_id: string) => {},
  invoices: [],
  invoicesStatus: RemoteDataState.NotStarted,
  marketplace: null,
  marketplaceStatus: RemoteDataState.NotStarted,
  zuoraParams: EMPTY_ZUORA_PARAMS,
  zuoraParamsStatus: RemoteDataState.NotStarted,
}

export const BillingContext =
  React.createContext<BillingContextType>(DEFAULT_CONTEXT)

export const BillingProvider: FC<Props> = React.memo(({children}) => {
  const dispatch = useDispatch()

  const {user} = useSelector(selectCurrentIdentity)

  const [zuoraParamsStatus, setZuoraParamsStatus] = useState(
    RemoteDataState.NotStarted
  )
  const [zuoraParams, setZuoraParams] =
    useState<CreditCardParams>(EMPTY_ZUORA_PARAMS)

  const [billingSettings, setBillingSettings] = useState({
    notifyEmail: user.email, // sets the default to the user's registered email
    balanceThreshold: BALANCE_THRESHOLD_DEFAULT, // set the default to the minimum balance threshold
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

  const [billingInfo, setBillingInfo] = useState<BillingInfo>(
    DEFAULT_CONTEXT.billingInfo
  )
  const [billingInfoStatus, setBillingInfoStatus] = useState(
    RemoteDataState.NotStarted
  )

  const handleGetZuoraParams = useCallback(async () => {
    try {
      setZuoraParamsStatus(RemoteDataState.Loading)
      const response = await getPaymentForm({form: 'billing'})

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      setZuoraParamsStatus(RemoteDataState.Done)
      setZuoraParams(response.data)
    } catch (error) {
      const message = getErrorMessage(error)
      dispatch(notify(zuoraParamsGetFailure(message)))
      setZuoraParamsStatus(RemoteDataState.Error)
    }
  }, [dispatch])

  const handleUpdatePaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      try {
        const resp = await putBillingPaymentMethod({
          data: {paymentMethodId},
        })

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        setBillingInfo(prevBilling => ({
          ...prevBilling,
          paymentMethod: resp.data,
        }))
      } catch (error) {
        const message = getErrorMessage(error)
        dispatch(notify(updatePaymentMethodError(message)))
      }
    },
    [dispatch]
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
      const message = getErrorMessage(error)
      dispatch(notify(getInvoicesError(message)))
      setInvoicesStatus(RemoteDataState.Error)
    }
  }, [dispatch])

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
      const message = getErrorMessage(error)
      dispatch(notify(getBillingInfoError(message)))
      setBillingInfoStatus(RemoteDataState.Error)
    }
  }, [dispatch])

  const handleUpdateBillingContact = useCallback(
    async (contact: BillingContact) => {
      try {
        const resp = await putBillingContact({data: contact})

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        setBillingInfo(prevBilling => ({
          ...prevBilling,
          contact: resp.data,
        }))
      } catch (error) {
        const message = getErrorMessage(error)
        dispatch(notify(updateBillingInfoError(message)))
      }
    },
    [dispatch]
  )

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
      const message = getErrorMessage(error)
      dispatch(notify(getMarketplaceError(message)))
      setMarketplaceStatus(RemoteDataState.Error)
    }
  }, [dispatch])

  const handleGetBillingSettings = useCallback(async () => {
    try {
      setBillingSettingsStatus(RemoteDataState.Loading)
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

      setBillingSettings(resp.data)
      setBillingSettingsStatus(RemoteDataState.Done)
    } catch (error) {
      setBillingSettingsStatus(RemoteDataState.Error)
      const message = getErrorMessage(error)
      dispatch(notify(getBillingSettingsError(message)))
    }
  }, [dispatch])

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
        setBillingSettingsStatus(RemoteDataState.Done)
      } catch (error) {
        setBillingSettingsStatus(RemoteDataState.Error)
        const message = getErrorMessage(error)
        dispatch(notify(updateBillingSettingsError(message)))
      }
    },
    [dispatch]
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
        handleUpdateBillingContact,
        handleUpdateBillingSettings,
        handleUpdatePaymentMethod,
        invoices,
        invoicesStatus,
        marketplace,
        marketplaceStatus,
        zuoraParams,
        zuoraParamsStatus,
      }}
    >
      {children}
    </BillingContext.Provider>
  )
})

export default BillingProvider
