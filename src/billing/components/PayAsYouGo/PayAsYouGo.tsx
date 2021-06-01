import React, {FC} from 'react'
import {
  FlexDirection,
  FlexBox,
  ComponentSize,
  AlignItems,
} from '@influxdata/clockface'

// Components
import PlanTypePanel from 'src/billing/components/PayAsYouGo/PlanTypePanel'
import PaymentPanel from 'src/billing/components/PaymentInfo/PaymentPanel'
import BillingContactInfo from 'src/billing/components/BillingContactInfo'
import InvoiceHistory from 'src/billing/components/PayAsYouGo/InvoiceHistory'
import CancellationPanel from 'src/billing/components/PayAsYouGo/CancellationPanel'
import NotificationPanel from 'src/billing/components/PayAsYouGo/NotificationPanel'
import InvoiceLoadingWrapper from 'src/billing/components/AssetLoading/InvoiceWrapper'
import BillingLoadingWrapper from 'src/billing/components/AssetLoading/BillingWrapper'
import BillingInfoWrapper from 'src/billing/components/AssetLoading/BillingInfoWrapper'

const BillingPayAsYouGo: FC = () => (
  <FlexBox
    direction={FlexDirection.Column}
    alignItems={AlignItems.Stretch}
    margin={ComponentSize.Small}
  >
    <BillingInfoWrapper>
      <>
        <PlanTypePanel />
        <InvoiceLoadingWrapper>
          <InvoiceHistory />
        </InvoiceLoadingWrapper>
        <PaymentPanel />
        <BillingContactInfo />
      </>
    </BillingInfoWrapper>
    <BillingLoadingWrapper>
      <NotificationPanel />
    </BillingLoadingWrapper>
    <CancellationPanel />
  </FlexBox>
)

export default BillingPayAsYouGo
