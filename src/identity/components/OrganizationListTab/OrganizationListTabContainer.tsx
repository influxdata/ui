// Libraries
import React, {FC} from 'react'
import {AutoSizer} from 'react-virtualized'
import {Page} from '@influxdata/clockface'

// Components
import AccountHeader from 'src/accounts/AccountHeader'
import AccountTabContainer from 'src/accounts/AccountTabContainer'
import {OrganizationListTab} from 'src/identity/components/OrganizationListTab'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Styles
const autoSizerStyle = {height: '100%', width: '100%'}

const titleTag = pageTitleSuffixer(['Account Organization List Page'])

export const OrganizationListTabContainer: FC = () => {
  return (
    <Page titleTag={titleTag}>
      <AutoSizer style={autoSizerStyle}>
        {({height}) => {
          return (
            <>
              <AccountHeader testID="account-page--header" />
              <AccountTabContainer activeTab="organizations">
                <OrganizationListTab pageHeight={height} />
              </AccountTabContainer>
            </>
          )
        }}
      </AutoSizer>
    </Page>
  )
}
