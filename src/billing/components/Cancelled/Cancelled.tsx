import React, {FC} from 'react'
import {
  FlexDirection,
  FlexBox,
  ComponentSize,
  AlignItems,
} from '@influxdata/clockface'

import PlanTypePanel from 'src/billing/components/PayAsYouGo/PlanTypePanel'
import PaymentPanel from 'src/billing/components/PaymentInfo/PaymentPanel'
import BillingContactInfo from 'src/billing/components/BillingContactInfo'
import InvoiceHistory from 'src/billing/components/PayAsYouGo/InvoiceHistory'
import InvoiceLoadingWrapper from 'src/billing/components/AssetLoading/InvoiceWrapper'
import PaymentMethodsLoadingWrapper from 'src/billing/components/AssetLoading/PaymentMethodsWrapper'
import RegionLoadingWrapper from 'src/billing/components/AssetLoading/RegionWrapper'

const BillingCancelled: FC = () => (
  <FlexBox
    direction={FlexDirection.Column}
    alignItems={AlignItems.Stretch}
    margin={ComponentSize.Small}
  >
    <RegionLoadingWrapper>
      <PlanTypePanel />
    </RegionLoadingWrapper>
    <InvoiceLoadingWrapper>
      <InvoiceHistory />
    </InvoiceLoadingWrapper>
    <PaymentMethodsLoadingWrapper>
      <PaymentPanel />
    </PaymentMethodsLoadingWrapper>
    <BillingContactInfo />
  </FlexBox>
)

export default BillingCancelled
