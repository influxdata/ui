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
type Entity = OrganizationSummaries[number] | UserAccount

export enum EntityLabel {
  DefaultAccount = 'Account',
  DefaultOrg = ' Organization',
}

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

const globalHeaderStyle = {width: '368px', backgroundColor: '#232533'}

interface Props {
  entityLabel: string
  defaultEntity: Entity
  entityList: Entity[]
  changeSelectedEntity: (action: SetStateAction<any>) => void
}

export const DefaultDropdown: FC<Props> = ({
  entityLabel,
  entityList,
  changeSelectedEntity,
  defaultEntity,
}) => {
  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      className="change-default-account-org--dropdown-flexbox"
    >
      <Form.Element
        label={`Default ${entityLabel}`}
        className="user-profile-page--form-element"
      >
        <GlobalHeaderDropdown
          mainMenuOptions={[]}
          onlyRenderSubmenu={true}
          typeAheadMenuOptions={entityList}
          typeAheadInputPlaceholder={`Search ${entityLabel}s ...`}
          typeAheadSelectedOption={defaultEntity}
          typeAheadOnSelectOption={changeSelectedEntity}
          style={globalHeaderStyle}
        />
      </Form.Element>
    </FlexBox>
  )
}
