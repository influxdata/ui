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
import {OrganizationSummaries} from 'src/client/unityRoutes'

// Style
import 'src/identity/components/userprofile/UserProfile.scss'

type DefaultOrg = OrganizationSummaries[number]

interface Props {
  label: string
  defaultOrg: DefaultOrg
  orgList: OrganizationSummaries
  changeSelectedOrg
}

export const DefaultOrgDropDown: FC<Props> = ({
  label,
  defaultOrg,
  changeSelectedOrg,
  orgList,
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
        {label}
      </Heading>
      <TypeAheadDropDown
        selectedOption={defaultOrg}
        items={orgList}
        onSelect={changeSelectedOrg}
        placeholderText="Select a Default Organization"
        className="change-account-org--typeahead"
      />
    </FlexBox>
  )
}
