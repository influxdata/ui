import React, {FC} from 'react'
import {
  FlexBox,
  FlexDirection,
  JustifyContent,
  ResourceCard,
} from '@influxdata/clockface'

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
      direction={FlexDirection.Row}
      justifyContent={JustifyContent.SpaceBetween}
      testID="account--organizations-tab-orgs-card"
    >
      <ResourceCard.Name
        name={name}
        className="account--organizations-tab-orgs-card-orgname"
      ></ResourceCard.Name>
      <ResourceCard.Meta>
        <FlexBox className="account--organizations-tab-orgs-card-cluster-data">
          <b>Cloud Provider:</b> &nbsp;{provider}
        </FlexBox>
        <FlexBox className="account--organizations-tab-orgs-card-cluster-data">
          <b>Region:</b> &nbsp;{regionCode}
        </FlexBox>
        <FlexBox className="account-organizations-tab-orgs-card-location-data">
          <b>Location:</b> &nbsp;{regionName}
        </FlexBox>
      </ResourceCard.Meta>
    </ResourceCard>
  )
}
