import React, {FC} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  FontWeight,
  Heading,
  HeadingElement,
  TypeAheadDropDown,
} from '@influxdata/clockface'

// Style
import 'src/identity/components/userprofile/UserProfile.scss'

// Types
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'

type Entity = OrganizationSummaries[number] | UserAccount

export enum EntityLabel {
  Account = 'Default Account',
  Org = 'Default Organization',
}

interface Props {
  entityLabel: string
  defaultEntity
  entityList
  changeSelectedEntity: VoidFunction
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
        {entityLabel}
      </Heading>
      <TypeAheadDropDown
        selectedOption={defaultEntity}
        items={entityList}
        onSelect={changeSelectedEntity}
        placeholderText={`Select a ${entityLabel}`}
        className="change-account-org--typeahead"
      />
    </FlexBox>
  )
}
