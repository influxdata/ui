// Libraries
import React, {FC} from 'react'

// Components
import BillingFree from 'src/billing/components/Free/Free'
import BillingPayAsYouGo from 'src/billing/components/PayAsYouGo/PayAsYouGo'
import BillingCancelled from 'src/billing/components/Cancelled/Cancelled'

// Utils
import {useBilling} from 'src/billing/components/BillingPage'

const BillingPageContents: FC = () => {
  const [{account}] = useBilling()

  switch (account.type) {
    case 'free':
      return <BillingFree />
    case 'pay_as_you_go':
      return <BillingPayAsYouGo />
    case 'cancelled':
      return <BillingCancelled />
  }
}

export default BillingPageContents
