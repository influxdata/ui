// Libraries
import React, {FC} from 'react'

import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  JustifyContent,
  Page,
} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Styles
import './style.scss'
import {DefaultAccountOrgChanger} from './DefaultAccountOrgChanger'
import {UserAccountProvider} from 'src/accounts/context/userAccount'
import {UserInfo} from './UserInfo'

export const UserProfilePage: FC = () => {
  const fullWidth = {width: '100%'}
  const pageMargins = {marginLeft: '32px', marginTop: '3px'}

  return (
    <>
      <Page
        titleTag={pageTitleSuffixer(['Settings', 'Organization'])}
        style={pageMargins}
      >
        <FlexBox
          direction={FlexDirection.Column}
          alignItems={AlignItems.FlexStart}
          justifyContent={JustifyContent.FlexStart}
          margin={ComponentSize.Medium}
          style={fullWidth}
        >
          <UserInfo />
          <UserAccountProvider>
            <DefaultAccountOrgChanger />
          </UserAccountProvider>
        </FlexBox>
      </Page>
    </>
  )
}
