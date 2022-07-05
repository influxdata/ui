// Libraries
import React, {FC, useEffect, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  UserAccountContext,
  UserAccountProvider,
} from 'src/accounts/context/userAccount'
import {UserProfilePage} from './ProfilePage'

import {
  AlignItems,
  AppWrapper,
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexBoxChild,
  FlexDirection,
  FontWeight,
  Heading,
  HeadingElement,
  Input,
  JustifyContent,
  Page,
} from '@influxdata/clockface'

// Components
// import OrgTabbedPage from 'src/organizations/components/OrgTabbedPage'
// import OrgHeader from 'src/organizations/components/OrgHeader'
// import OrgProfileTab from 'src/organizations/components/OrgProfileTab'
// import RenameOrgOverlay from 'src/organizations/components/RenameOrgOverlay'
// import DeleteOrgOverlay from 'src/organizations/components/DeleteOrgOverlay'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
// import {getQuartzMe} from 'src/me/selectors'
// import DeleteOrgProvider from 'src/organizations/components/DeleteOrgContext'

// Constants
import {selectQuartzIdentity} from 'src/identity/selectors'
// Change name of this
import './style.scss'
import LabeledData from './LabeledData'
import {DefaultAccountDropDown} from './DefaultAccountDropdown'

/*

// Libraries
import React, {FC} from 'react'

// Components
import {
  FlexBox,
  AlignItems,
  FlexDirection,
  ComponentSize,
  Heading,
  HeadingElement,
  FontWeight,
} from '@influxdata/clockface'

interface Props {
  label: string
  src: string
}

const LabeledData: FC<Props> = ({label, src}) => (
  <FlexBox
    direction={FlexDirection.Column}
    margin={ComponentSize.Large}
    alignItems={AlignItems.FlexStart}
  >
    <Heading
      className="org-profile-tab--heading"
      element={HeadingElement.H4}
      weight={FontWeight.Regular}
    >
      {label}
    </Heading>
    <span style={{fontWeight: FontWeight.Light, width: '100%'}}>{src}</span>
  </FlexBox>
)

export default LabeledData


*/

export const UserProfileContainer: FC = () => {
  return (
    <UserAccountProvider>
      <UserProfilePage />
    </UserAccountProvider>
  )
}
