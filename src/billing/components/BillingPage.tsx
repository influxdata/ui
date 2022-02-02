// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import BillingPageContents from 'src/billing/components/BillingPageContents'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import LimitChecker from 'src/cloud/components/LimitChecker'
import BillingProvider from 'src/billing/context/billing'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import AccountTabContainer from 'src/accounts/AccountTabContainer'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const BillingPage: FC = () => {
  let contents = null

  if (isFlagEnabled('multiAccount')) {
    contents = (
      <>
        <Page.Header fullWidth={false}>
          <Page.Title title="Account" />
        </Page.Header>
        <AccountTabContainer activeTab="billing">
          <BillingPageContents />
        </AccountTabContainer>
      </>
    )
  } else {
    contents = (
      <>
        <Page.Header fullWidth={false} testID="billing-page--header">
          <Page.Title title="Billing" />
          <LimitChecker>
            <RateLimitAlert />
          </LimitChecker>
        </Page.Header>
        <Page.Contents scrollable={true} testID="billing-page-contents--scroll">
          <BillingPageContents />
        </Page.Contents>
      </>
    )
  }

  return (
    <BillingProvider>
      <Page titleTag={pageTitleSuffixer(['Billing'])}>{contents}</Page>
    </BillingProvider>
  )
}

export default BillingPage
