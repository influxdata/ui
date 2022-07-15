import React, {FC, SetStateAction} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  FontWeight,
  Heading,
  HeadingElement,
  SelectableItem,
  TypeAheadDropDown,
} from '@influxdata/clockface'

// Style
import 'src/identity/components/userprofile/UserProfile.scss'

// Types
export enum EntityLabel {
  Account = 'Default Account',
  Org = 'Default Organization',
}
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'
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
        {entityLabel}
      </Heading>
      <TypeAheadDropDown
        selectedOption={defaultEntity as SelectableItem}
        items={entityList as SelectableItem[]}
        onSelect={changeSelectedEntity}
        placeholderText={`Select a ${entityLabel}`}
        className="change-account-org--typeahead"
      />
    </FlexBox>
  )
}
