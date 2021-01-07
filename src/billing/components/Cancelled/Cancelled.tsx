import React, {Component} from 'react'
import {
  FlexDirection,
  FlexBox,
  ComponentSize,
  AlignItems,
} from '@influxdata/clockface'

import PlanTypePanel from 'src/billing/components/PayAsYouGo/PlanTypePanel'
import StoredPaymentMethod from 'src/billing/components/PaymentInfo/StoredPaymentMethod'
import BillingContactInfo from 'src/billing/components/BillingContactInfo'
import BillingPageContext from 'src/billing/components/BillingPageContext'
import InvoiceHistory from 'src/billing/components/PayAsYouGo/InvoiceHistory'

class BillingCancelled extends Component {
  static contextType = BillingPageContext
  constructor(props) {
    super(props)
  }

  render() {
    const {region, account, invoices, paymentMethods} = this.props
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
      </FlexBox>
    )
  }
}

export default BillingCancelled
