// Constants
import {CLOUD} from 'src/shared/constants'

// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import BillingFree from 'src/billing/components/Free/Free'
import BillingPayAsYouGo from 'src/billing/components/PayAsYouGo/PayAsYouGo'
import MarketplaceBilling from 'src/billing/components/marketplace/MarketplaceBilling'

// Utils
import {selectCurrentIdentity} from 'src/identity/selectors'

// Thunks
import {getBillingProviderThunk} from 'src/identity/actions/thunks'

const BillingPageContents: FC = () => {
  const dispatch = useDispatch()
  const {account} = useSelector(selectCurrentIdentity)

  useEffect(() => {
    if (!CLOUD) {
      return
    }

    if (!account.billingProvider) {
      dispatch(getBillingProviderThunk())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (account?.billingProvider === null) {
    return <BillingFree />
  }

  if (account?.billingProvider !== 'zuora') {
    return <MarketplaceBilling />
  }

  if (account?.type === 'pay_as_you_go') {
    return <BillingPayAsYouGo />
  }

  return <BillingFree />
}

export default BillingPageContents
