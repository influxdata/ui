import React, {Component} from 'react'
import {
  FlexDirection,
  FlexBox,
  ComponentSize,
  AlignItems,
} from '@influxdata/clockface'

import PlanTypePanel from './PlanTypePanel'
import StoredPaymentMethod from 'src/billing/components/PaymentInfo/StoredPaymentMethod'
import CancellationPanel from './CancellationPanel'
import BillingContactInfo from 'src/billing/components/BillingContactInfo'
import BillingPageContext from 'src/billing/components/BillingPageContext'
import NotificationPanel from './NotificationPanel'
import InvoiceHistory from './InvoiceHistory'

class BillingPayAsYouGo extends Component {
  static contextType = BillingPageContext
  render() {
    const {
      region,
      account,
      invoices,
      paymentMethods,
      balanceThreshold,
      isNotify,
      notifyEmail,
    } = this.props
    const {contact, countries, states, ccPageParams} = this.context

    return (
      <FlexBox
        direction={FlexDirection.Column}
        alignItems={AlignItems.Stretch}
        margin={ComponentSize.Small}
      >
        <PlanTypePanel region={region} account={account} />
        <InvoiceHistory invoices={invoices} />
        <StoredPaymentMethod
          paymentMethods={paymentMethods}
          hostedPage={ccPageParams}
        />
        <BillingContactInfo
          countries={countries}
          states={states}
          contact={contact}
          hide={false}
          basePath={'privateAPI/billing'}
        />
        <NotificationPanel
          balanceThreshold={balanceThreshold}
          isNotify={isNotify}
          notifyEmail={notifyEmail}
        />
        <CancellationPanel />
      </FlexBox>
    )
  }
}

export default BillingPayAsYouGo
