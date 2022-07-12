// Libraries
import React, {FC} from 'react'

import {FontWeight, Heading, HeadingElement, Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Styles
import {DefaultAccountOrgChanger} from './DefaultAccountOrgChanger'
import {UserAccountProvider} from 'src/accounts/context/userAccount'
import {UserInfo} from './UserInfo'

export const UserProfilePage: FC = () => {
  const pageMargins = {marginLeft: '32px', marginTop: '3px'}

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['User Profile'])} style={pageMargins}>
        <Heading weight={FontWeight.Bold} element={HeadingElement.H1}>
          User Profile
        </Heading>
        <UserInfo />
        <UserAccountProvider>
          <DefaultAccountOrgChanger />
        </UserAccountProvider>
      </Page>
    </>
  )
}
