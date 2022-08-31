// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import BillingPageContents from 'src/billing/components/BillingPageContents'
import BillingProvider from 'src/billing/context/billing'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import LimitChecker from 'src/cloud/components/LimitChecker'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import AccountTabContainer from 'src/accounts/AccountTabContainer'
import {isFlagEnabled} from '../../shared/utils/featureFlag'

const BillingPage: FC = () => {
  return (
    <BillingProvider>
      <Page titleTag={pageTitleSuffixer(['Billing'])}>
        <Page.Header fullWidth={true} testID="billing-page--header">
          <Page.Title title="Account" />
          <LimitChecker>
            {!isFlagEnabled('multiOrg') && <RateLimitAlert location="billing" />}
          </LimitChecker>
        </Page.Header>
        <AccountTabContainer activeTab="billing">
          <BillingPageContents />
        </AccountTabContainer>
      </Page>
    </BillingProvider>
  )
}

export default BillingPage
