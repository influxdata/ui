import React, {FC} from 'react'
import {FlexBox, JustifyContent, ResourceCard} from '@influxdata/clockface'

// Styles
import './OrganizationCard.scss'

interface OrgCardProps {
  name: string
  provider: string
  regionCode: string
  regionName: string
}

export const OrganizationCard: FC<OrgCardProps> = ({
  name,
  provider,
  regionCode,
  regionName,
}) => {
  return (
    <ResourceCard
      className="account--organizations-tab-orgs-card"
      justifyContent={JustifyContent.SpaceBetween}
      testID="account--organizations-tab-orgs-card"
    >
      <ResourceCard.Name
        name={name}
        className="account--organizations-tab-orgs-card-orgname"
      ></ResourceCard.Name>
      <ResourceCard.Meta>
        <FlexBox.Child className="account--organizations-tab-orgs-card-cluster-data">
          Cloud Provider: {provider}
        </FlexBox.Child>
        <FlexBox.Child className="account--organizations-tab-orgs-card-cluster-data">
          Region: {regionCode}
        </FlexBox.Child>
        <FlexBox.Child className="account-organizations-tab-orgs-card-location-data">
          Location: {regionName}
        </FlexBox.Child>
      </ResourceCard.Meta>
    </ResourceCard>
  )
}
