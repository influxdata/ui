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
        testID={headerTestID}
      >
        <GlobalHeaderDropdown
          defaultTestID={defaultTestID}
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
