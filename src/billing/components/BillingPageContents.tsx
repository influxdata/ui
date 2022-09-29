// Constants
import {CLOUD} from 'src/shared/constants'

// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import BillingFree from 'src/billing/components/Free/Free'
import BillingPayAsYouGo from 'src/billing/components/PayAsYouGo/PayAsYouGo'
import MarketplaceBilling from 'src/billing/components/marketplace/MarketplaceBilling'

// Types
import {RemoteDataState} from 'src/types'

// Utils
import {
  selectCurrentIdentity,
  selectQuartzBillingStatus,
} from 'src/identity/selectors'

// Thunks
import {getBillingProviderThunk} from 'src/identity/actions/thunks'

const BillingPageContents: FC = () => {
  const dispatch = useDispatch()
  const {account} = useSelector(selectCurrentIdentity)
  const quartzBillingStatus = useSelector(selectQuartzBillingStatus)

  useEffect(() => {
    if (!CLOUD) {
      return
    }

    if (quartzBillingStatus === RemoteDataState.NotStarted) {
      dispatch(getBillingProviderThunk())
    }
  }, [dispatch, quartzBillingStatus])

  if (account.billingProvider === undefined) {
    return null
  }

  if (account.billingProvider === null) {
    return <BillingFree />
  }

  if (account.billingProvider !== 'zuora') {
    return <MarketplaceBilling />
  }

  if (account.type === 'pay_as_you_go') {
    return <BillingPayAsYouGo />
  }

  return <BillingFree />
}

export default BillingPageContents
