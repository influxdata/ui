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
import {getQuartzMe} from 'src/me/selectors'

// Thunks
import {getBillingProviderThunk} from 'src/identity/actions/thunks'

const BillingPageContents: FC = () => {
  const dispatch = useDispatch()
  const quartzMe = useSelector(getQuartzMe)

  useEffect(() => {
    if (!CLOUD) {
      return
    }

    if (!quartzMe.billingProvider) {
      dispatch(getBillingProviderThunk())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (quartzMe?.billingProvider === null) {
    return <BillingFree />
  }

  if (quartzMe?.billingProvider !== 'zuora') {
    return <MarketplaceBilling />
  }

  if (quartzMe?.accountType === 'pay_as_you_go') {
    return <BillingPayAsYouGo />
  }

  return <BillingFree />
}

export default BillingPageContents
