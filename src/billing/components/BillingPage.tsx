// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import BillingPageContents from 'src/billing/components/BillingPageContents'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import LimitChecker from 'src/cloud/components/LimitChecker'
import BillingProvider from 'src/billing/context/billing'

const BillingPage: FC = () => (
  <BillingProvider>
    <Page titleTag="Billing">
      <Page.Header fullWidth={false} testID="billing-page--header">
        <Page.Title title="Billing" />
        <LimitChecker>
          <RateLimitAlert />
        </LimitChecker>
      </Page.Header>
      <Page.Contents scrollable={true} testID="billing-page-contents--scroll">
        <BillingPageContents />
      </Page.Contents>
    </Page>
  </BillingProvider>
)

export default BillingPage
