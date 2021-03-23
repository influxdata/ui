// Libraries
import React, {FC} from 'react'

// Components
import BillingFree from 'src/billing/components/Free/Free'
import BillingPayAsYouGo from 'src/billing/components/PayAsYouGo/PayAsYouGo'

// Utils
import {useBilling} from 'src/billing/components/BillingPage'

const BillingPageContents: FC = () => {
  const [{account}] = useBilling()

  if (account.type === 'pay_as_you_go') {
    return <BillingPayAsYouGo />
  }

  return <BillingFree />
}

export default BillingPageContents
