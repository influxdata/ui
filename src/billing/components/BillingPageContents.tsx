// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector} from 'react-redux'

// Components
import BillingFree from 'src/billing/components/Free/Free'
import BillingPayAsYouGo from 'src/billing/components/PayAsYouGo/PayAsYouGo'
import MarketplaceBilling from 'src/billing/components/marketplace/MarketplaceBilling'

// Utils
import {getQuartzMe} from 'src/me/selectors'

//Thunks
import {getAccountDetailsThunk} from 'src/identity/actions/thunks'

const BillingPageContents: FC = () => {
  // Leave this constant quartzMe for now. This will be changed to 'identity' when removing the legacy /quartz/me code when it is no longer used.
  const quartzMe = useSelector(getQuartzMe)

  useEffect(() => {
    // Check this condition. Need to decide what default state is for re-running,
    // since I think billingProvider needs to be populated.
    if (!quartzMe.billingProvider) {
      getAccountDetailsThunk()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (
    (quartzMe?.accountType === 'pay_as_you_go' ||
      quartzMe?.accountType === 'contract') &&
    quartzMe?.billingProvider !== 'zuora'
  ) {
    return <MarketplaceBilling />
  }

  if (quartzMe?.accountType === 'pay_as_you_go') {
    return <BillingPayAsYouGo />
  }

  return <BillingFree />
}

export default BillingPageContents
