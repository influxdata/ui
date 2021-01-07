import React, {Component} from 'react'

import BillingFree from 'src/billing/components/Free/Free'
import BillingPayAsYouGo from 'src/billing/components/PayAsYouGo/PayAsYouGo'
import BillingCancelled from 'src/billing/components/Cancelled/Cancelled'

class BillingPageContents extends Component {
  render() {
    const {
      accountType,
      invoices,
      paymentMethods,
      balanceThreshold,
      account,
      orgLimits,
      isNotify,
      notifyEmail,
      region,
    } = this.props

    switch (accountType) {
      case 'free':
        return (
          <BillingFree orgLimits={orgLimits} isRegionBeta={region.isBeta} />
        )
      case 'pay_as_you_go':
        return (
          <BillingPayAsYouGo
            region={region}
            invoices={invoices}
            paymentMethods={paymentMethods}
            account={account}
            balanceThreshold={balanceThreshold}
            isNotify={isNotify}
            notifyEmail={notifyEmail}
          />
        )
      case 'cancelled':
        return (
          <BillingCancelled
            region={region}
            invoices={invoices}
            paymentMethods={paymentMethods}
            account={account}
          />
        )
    }
  }
}

export default BillingPageContents
