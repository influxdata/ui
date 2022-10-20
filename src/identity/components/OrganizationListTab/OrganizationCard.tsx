import React, {FC} from 'react'
import {
  FlexBox,
  ResourceCard,
  FlexDirection,
  JustifyContent,
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
      <FlexBox className="account--organizations-tab-orgs-card-orgname">
        {name}
      </FlexBox>
      <ResourceCard.Meta
        style={{
          justifyContent: 'flex-end',
        }}
      >
        <FlexBox className="account--organizations-tab-orgs-card-container">
          <FlexBox.Child className="account--organizations-tab-orgs-card-cluster-data">
            Cloud Provider: {provider}
          </FlexBox.Child>
          <FlexBox.Child className="account--organizations-tab-orgs-card-cluster-data">
            Region: {regionCode}
          </FlexBox.Child>
          <FlexBox.Child className="account--organizations-tab-orgs-card-cluster-data">
            Location: {regionName}
          </FlexBox.Child>
        </FlexBox>
      </ResourceCard.Meta>
    </ResourceCard>
  )
}
