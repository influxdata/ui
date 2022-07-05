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
      style={{
        marginLeft: '8px',
        marginRight: '8px',
      }}
    >
      <Heading
        className="org-profile-tab--heading"
        element={HeadingElement.H4}
        weight={FontWeight.Medium}
      >
        {label}
      </Heading>
      <TypeAheadDropDown
        selectedOption={defaultOrg}
        items={orgList}
        onSelect={changeSelectedOrg}
        placeholderText="Select a Default Organization"
        style={{width: '250px'}}
      />
    </FlexBox>
  )
}
