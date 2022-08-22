// Libraries
import React, {FC, SetStateAction} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Form,
} from '@influxdata/clockface'

// Components
import {GlobalHeaderDropdown} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'

// Types
type Entity = OrganizationSummaries[number] | UserAccount
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'

export enum EntityLabel {
  DefaultAccount = 'Account',
  DefaultOrg = 'Organization',
}

import {
  MainMenuEventPrefix,
  TypeAheadEventPrefix,
  UserProfileEventPrefix,
} from 'src/identity/events/multiOrgEvents'
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

const globalHeaderStyle = {width: '368px', backgroundColor: '#232533'}

interface Props {
  changeSelectedEntity: (action: SetStateAction<any>) => void
  defaultEntity: Entity
  defaultTestID: string
  entityLabel: string
  entityList: Entity[]
  headerTestID: string
}

export const DefaultDropdown: FC<Props> = ({
  changeSelectedEntity,
  defaultEntity,
  defaultTestID,
  entityLabel,
  entityList,
  headerTestID,
}) => {
  let mainMenuEventPrefix: MainMenuEventPrefix
  let typeAheadMenuEventPrefix: TypeAheadEventPrefix
  let entityAbbreviation: UserProfileEventPrefix

  // This component is used in both dropdowns on the user profile page; so determine the appropriate event name
  // based on the entity (account vs. org) for which the dropdown is being used.
  if (entityLabel === EntityLabel.DefaultAccount) {
    mainMenuEventPrefix = MainMenuEventPrefix.ChangeDefaultAccount
    typeAheadMenuEventPrefix = TypeAheadEventPrefix.UserProfileSearchAccount
    entityAbbreviation = UserProfileEventPrefix.Account
  } else {
    mainMenuEventPrefix = MainMenuEventPrefix.ChangeDefaultOrg
    typeAheadMenuEventPrefix = TypeAheadEventPrefix.UserProfileSearchOrg
    entityAbbreviation = UserProfileEventPrefix.Organization
  }

  const sendUserProfileDropdownEvent = () => {
    event(
      `${UserProfileEventPrefix.Default}${entityAbbreviation}Dropdown.clicked`,
      {initiative: 'multiOrg'}
    )
  }

  return (
    <FlexBox
      alignItems={AlignItems.FlexStart}
      className="change-default-account-org--dropdown-flexbox"
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      onClick={sendUserProfileDropdownEvent}
    >
      <Form.Element
        className="user-profile-page--form-element"
        label={`Default ${entityLabel}`}
        testID={headerTestID}
      >
        <GlobalHeaderDropdown
          defaultTestID={defaultTestID}
          mainMenuEventPrefix={mainMenuEventPrefix}
          mainMenuOptions={[]}
          onlyRenderSubmenu={true}
          style={globalHeaderStyle}
          typeAheadEventPrefix={typeAheadMenuEventPrefix}
          typeAheadInputPlaceholder={`Search ${entityLabel}s ...`}
          typeAheadMenuOptions={entityList}
          typeAheadOnSelectOption={changeSelectedEntity}
          typeAheadSelectedOption={defaultEntity}
        />
      </Form.Element>
    </FlexBox>
  )
}
