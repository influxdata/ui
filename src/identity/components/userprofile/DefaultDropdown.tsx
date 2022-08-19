// Libraries
import React, {FC, SetStateAction} from 'react'
import {useDispatch} from 'react-redux'
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
  DefaultOrg = ' Organization',
}

import {
  MainMenuEvent,
  multiOrgEvent,
  TypeAheadEventPrefix,
  UserProfileEventPrefix,
} from 'src/identity/events/multiOrgEvents'

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
  const dispatch = useDispatch()

  // This component is used for both dropdowns on the user profile page; so determine the appropriate event name
  // based on the entity ('account versus org') for which the dropdown is being used.
  const mainMenuEventPrefix =
    entityLabel === EntityLabel.DefaultAccount
      ? MainMenuEvent.ChangDefaultAccount
      : MainMenuEvent.ChangeDefaultOrg

  const typeAheadMenuEventPrefix =
    entityLabel === EntityLabel.DefaultAccount
      ? TypeAheadEventPrefix.UserProfileSearchAccount
      : TypeAheadEventPrefix.UserProfileSearchOrg

  const sendUserProfileDropdownEvent = () => {
    dispatch(multiOrgEvent(`${UserProfileEventPrefix}${entityLabel}.clicked`))
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
