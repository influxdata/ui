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
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'
import {DropdownName} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'
type Entity = OrganizationSummaries[number] | UserAccount
import {TypeAheadLocation} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/GlobalHeaderTypeAheadMenu'

export enum EntityLabel {
  DefaultAccount = 'Account',
  DefaultOrg = ' Organization',
}

import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

const globalHeaderStyle = {width: '368px', backgroundColor: '#232533'}

interface Props {
  changeSelectedEntity: (action: SetStateAction<any>) => void
  defaultEntity: Entity
  defaultTestID: string
  entityList: Entity[]
  entityLabel: string
  headerTestID: string
}

export const DefaultDropdown: FC<Props> = ({
  changeSelectedEntity,
  defaultEntity,
  defaultTestID,
  entityList,
  entityLabel,
  headerTestID,
}) => {
  const dropdownName =
    entityLabel === EntityLabel.DefaultAccount
      ? DropdownName.UserProfileDefaultAccount
      : DropdownName.UserProfileDefaultOrg

  const dropdownLocation =
    entityLabel === EntityLabel.DefaultAccount
      ? TypeAheadLocation.UserProfileSearchAccount
      : TypeAheadLocation.UserProfileSearchOrg

  // Likewise, this is going to end up being a bit excessive, I suspect.
  const handleClick = () => {
    event(`default${entityLabel}Dropdown.click`)
  }

  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      className="change-default-account-org--dropdown-flexbox"
      onClick={handleClick}
    >
      <Form.Element
        label={`Default ${entityLabel}`}
        className="user-profile-page--form-element"
        testID={headerTestID}
      >
        <GlobalHeaderDropdown
          dropdownLocation={dropdownLocation}
          defaultTestID={defaultTestID}
          entity={dropdownName}
          mainMenuOptions={[]}
          onlyRenderSubmenu={true}
          style={globalHeaderStyle}
          typeAheadMenuOptions={entityList}
          typeAheadInputPlaceholder={`Search ${entityLabel}s ...`}
          typeAheadSelectedOption={defaultEntity}
          typeAheadOnSelectOption={changeSelectedEntity}
        />
      </Form.Element>
    </FlexBox>
  )
}
