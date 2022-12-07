import React, {FC} from 'react'
import {
  FlexBox,
  FlexDirection,
  JustifyContent,
  ResourceCard,
  QuestionMarkTooltip,
} from '@influxdata/clockface'

// Styles
import './OrganizationCard.scss'

interface OrgCardProps {
  name: string
  provider: string
  regionCode: string
  regionName: string
  provisioningStatus: string
}

export const OrganizationCard: FC<OrgCardProps> = ({
  name,
  provider,
  regionCode,
  regionName,
  provisioningStatus,
}) => {

  const isOrgSuspended = provisioningStatus === 'suspended'

  const tooltipContent = (
    <p>
      Organizations can be reactivated within 7 days. Contact support at{' '}
      <a
        href="mailto:support@influxdata.com"
        target="_blank"
        rel="noreferrer noopener"
      >
        support@influxdata.com
      </a>{' '}
      to reactivate.
    </p>
  )

  return (
    <ResourceCard
      className={
        isOrgSuspended
          ? 'account--organizations-tab-suspended-orgs-card'
          : 'account--organizations-tab-orgs-card'
      }
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
        <FlexBox
          justifyContent={JustifyContent.SpaceBetween}
          className="account-organizations-tab-orgs-card-org-status"
        >
          {isOrgSuspended && (
            <>
              <b className="account-organizations-tab-orgs-status--text">
                Deletion in progress
              </b>
              <QuestionMarkTooltip
                diameter={15}
                tooltipContents={tooltipContent}
              />
            </>
          )}
        </FlexBox>
      </ResourceCard.Meta>
    </ResourceCard>
  )
}
