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
import {shouldUseQuartzIdentity} from 'src/identity/utils/shouldUseQuartzIdentity'

const BillingPageContents: FC = () => {
  const dispatch = useDispatch()
  const quartzMe = useSelector(getQuartzMe)

  useEffect(() => {
    if (CLOUD && shouldUseQuartzIdentity() && !quartzMe.billingProvider) {
      dispatch(getBillingProviderThunk())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (
    (quartzMe?.accountType === 'pay_as_you_go' ||
      quartzMe?.accountType === 'contract') &&
    // This additional check is needed because, on page load, billingProvider (esp. with /identity on) may be 'null', which !== 'zuora. A 'null' billingProvider corresponds to free accounts.
    quartzMe.billingProvider !== null &&
    quartzMe.billingProvider !== 'zuora'
  ) {
    return <MarketplaceBilling />
  }

  if (quartzMe?.accountType === 'pay_as_you_go') {
    return <BillingPayAsYouGo />
  }

  return <BillingFree />
}

export default BillingPageContents
