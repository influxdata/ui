// Libraries
import React, {FC, SetStateAction} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  FontWeight,
  Heading,
  HeadingElement,
} from '@influxdata/clockface'

// Components
import {GlobalHeaderDropdown} from '../GlobalHeader/GlobalHeaderDropdown'

// Types
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'
type Entity = OrganizationSummaries[number] | UserAccount

export enum EntityLabel {
  DefaultAccount = 'Account',
  DefaultOrg = ' Organization',
}

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

interface Props {
  entityLabel: string
  defaultEntity: Entity
  entityList: Entity[]
  changeSelectedEntity: (action: SetStateAction<any>) => void
}

export const DefaultDropdown: FC<Props> = ({
  entityLabel,
  defaultEntity,
  entityList,
  changeSelectedEntity,
}) => {
  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      className="change-default-account-org--dropdown"
    >
      <Heading
        element={HeadingElement.H5}
        weight={FontWeight.Medium}
        className="change-default-account-org-dropdown--header"
      >
        {`Default ${entityLabel}`}
      </Heading>
      <GlobalHeaderDropdown
        mainMenuOptions={[]}
        typeAheadOnly={true}
        typeAheadMenuOptions={entityList}
        typeAheadInputPlaceholder={`Search ${entityLabel}s ...`}
        typeAheadSelectedOption={defaultEntity}
        typeAheadOnSelectOption={changeSelectedEntity}
        className="user-profile-page--default-dropdowns"
      />
    </FlexBox>
  )
}
