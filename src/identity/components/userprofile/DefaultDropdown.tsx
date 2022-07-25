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

// Style
import 'src/identity/components/userprofile/UserProfile.scss'

// Types
export enum EntityLabel {
  DefaultAccount = 'Account',
  DefaultOrg = ' Organization',
}

import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'
import {GlobalHeaderDropdown} from '../GlobalHeader/GlobalHeaderDropdown'
type Entity = OrganizationSummaries[number] | UserAccount

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
      className="change-account-org-dropdown--container"
    >
      <Heading
        element={HeadingElement.H5}
        weight={FontWeight.Medium}
        className="change-account-org-dropdown--header"
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
        style={{width: '250px'}}
      />
    </FlexBox>
  )
}
