// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Panel,
  ResourceList,
} from '@influxdata/clockface'
import PlanTypePanel from 'src/billing/components/PayAsYouGo/PlanTypePanel'
import PaymentPanel from 'src/billing/components/PaymentInfo/PaymentPanel'
import BillingContactInfo from 'src/billing/components/BillingContactInfo'
import InvoiceHistory from 'src/billing/components/PayAsYouGo/InvoiceHistory'
import CancellationPanel from 'src/billing/components/PayAsYouGo/CancellationPanel'
import NotificationPanel from 'src/billing/components/PayAsYouGo/NotificationPanel'
import InvoiceLoadingWrapper from 'src/billing/components/AssetLoading/InvoiceWrapper'
import BillingInfoWrapper from 'src/billing/components/AssetLoading/BillingInfoWrapper'
import {PricingAlert} from 'src/billing/components/PayAsYouGo/PricingAlert'

// Utils
import {selectCurrentIdentity} from 'src/identity/selectors'

const BillingPayAsYouGo: FC = () => {
  const {account} = useSelector(selectCurrentIdentity)
  const isdDirectSignup = account.billingProvider === 'zuora'

  return (
    <FlexBox
      direction={FlexDirection.Column}
      alignItems={AlignItems.Stretch}
      margin={ComponentSize.Small}
    >
      <BillingInfoWrapper>
        <>
          {isdDirectSignup && <PricingAlert />}
          <PlanTypePanel />
          <Panel>
            <Panel.Header testID="past-invoices--header">
              <h4>Past Invoices</h4>
            </Panel.Header>
            <Panel.Body>
              <ResourceList>
                <InvoiceLoadingWrapper>
                  <InvoiceHistory />
                </InvoiceLoadingWrapper>
              </ResourceList>
            </Panel.Body>
          </Panel>
          <PaymentPanel />
          <BillingContactInfo />
        </>
      </BillingInfoWrapper>
      <NotificationPanel />
      <CancellationPanel />
    </FlexBox>
  )
}

export default BillingPayAsYouGo
