// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import BillingPageContents from 'src/billing/components/BillingPageContents'
import BillingProvider from 'src/billing/context/billing'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import AccountTabContainer from '../../accounts/AccountTabContainer'

const BillingPage: FC = () => (
  <BillingProvider>
    <Page titleTag={pageTitleSuffixer(['Billing'])}>
      <AccountTabContainer activeTab="billing">
        <BillingPageContents />
      </AccountTabContainer>
    </Page>
  </BillingProvider>
)

export default BillingPage
