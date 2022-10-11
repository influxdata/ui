// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import BillingPageContents from 'src/billing/components/BillingPageContents'
import BillingProvider from 'src/billing/context/billing'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import AccountTabContainer from 'src/accounts/AccountTabContainer'

const BillingPage: FC = () => {
  return (
    <BillingProvider>
      <Page titleTag={pageTitleSuffixer(['Billing'])}>
        <Page.Header fullWidth={true} testID="billing-page--header">
          <Page.Title title="Account" />
        </Page.Header>
        <AccountTabContainer activeTab="billing">
          <BillingPageContents />
        </AccountTabContainer>
      </Page>
    </BillingProvider>
  )
}

export default BillingPage
