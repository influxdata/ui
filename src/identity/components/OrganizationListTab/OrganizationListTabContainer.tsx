// Libraries
import React, {FC} from 'react'
import {AutoSizer} from 'react-virtualized'

// Components
import AccountHeader from 'src/accounts/AccountHeader'
import AccountTabContainer from 'src/accounts/AccountTabContainer'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Style
import {Page} from '@influxdata/clockface'
import {OrganizationListTab} from 'src/identity/components/OrganizationListTab'

export const OrganizationListTabContainer: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['Account Organization List Page'])}>
      <AutoSizer style={{height: '100%', width: '100%'}}>
        {({height}) => {
          return (
            <>
              <AccountHeader testID="account-page--header" />
              <AccountTabContainer activeTab="organizations">
                <OrganizationListTab height={height} />
              </AccountTabContainer>
            </>
          )
        }}
      </AutoSizer>
    </Page>
  )
}
