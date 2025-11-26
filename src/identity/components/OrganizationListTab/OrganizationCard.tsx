import React, {FC} from 'react'
import {
  FlexBox,
  FlexDirection,
  JustifyContent,
  QuestionMarkTooltip,
  ResourceCard,
} from '@influxdata/clockface'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Styles
import './OrganizationCard.scss'

interface OrgCardProps {
  name: string
  isActive: boolean
  provider: string
  provisioningStatus?: string
  regionCode: string
  regionName: string
}

const tooltipContent = (
  <p>
    Organizations can be reactivated within 7 days of deletion. Please use the
    Contact Support option in the Help menu to reactivate.
  </p>
)

export const OrganizationCard: FC<OrgCardProps> = ({
  name,
  isActive,
  provider,
  provisioningStatus,
  regionCode,
  regionName,
}) => {
  const isOrgSuspended = provisioningStatus === 'suspended'

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
      {isActive && (
        <span className="account--organizations-tab-active-org"></span>
      )}
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
