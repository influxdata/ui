// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Components
import BillingFree from 'src/billing/components/Free/Free'
import BillingPayAsYouGo from 'src/billing/components/PayAsYouGo/PayAsYouGo'
import MarketplaceBilling from 'src/billing/components/marketplace/MarketplaceBilling'

// Utils
import {getQuartzMe} from 'src/me/selectors'

const BillingPageContents: FC = () => {
  const quartzMe = useSelector(getQuartzMe)

  if (!!quartzMe.billingProvider) {
    return <MarketplaceBilling />
  }

  if (quartzMe.accountType === 'pay_as_you_go') {
    return <BillingPayAsYouGo />
  }

  return <BillingFree />
}

export default BillingPageContents
