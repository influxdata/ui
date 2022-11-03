import React, {FC, useContext} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  InputLabel,
  JustifyContent,
} from '@influxdata/clockface'

// Style
import './ProviderChooser.scss'

// Components
import {CreateOrgContext} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/CreateOrganizationContext'
import {ClusterBox} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ClusterBox'
import {RegionDropdown} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/RegionDropdown'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

export const ProviderChooser: FC = () => {
  const {clusters} = useContext(CreateOrgContext)
  const clusterKeys = Object.keys(clusters)

  return (
    <FlexBox
      alignItems={AlignItems.FlexStart}
      className="provider-and-region-chooser"
      direction={FlexDirection.Column}
      justifyContent={JustifyContent.Center}
      margin={ComponentSize.Large}
      stretchToFitWidth={true}
    >
      <InputLabel className="prc-title">Provider & Region</InputLabel>
      <InputLabel className="prc-description" size={ComponentSize.Small}>
        Tell us where you would like to store the time series data for this
        organization.
      </InputLabel>
      <FlexBox
        alignItems={AlignItems.Stretch}
        className="prc-cluster-boxes-container"
        justifyContent={JustifyContent.FlexStart}
        stretchToFitWidth={true}
        direction={FlexDirection.Column}
      >
        <FlexBox
          alignItems={AlignItems.Stretch}
          className="prc-cluster-boxes"
          stretchToFitWidth={true}
        >
          {clusterKeys.map((providerId, i) => {
            const {providerName} = clusters[providerId][0]
            return (
              <ClusterBox
                providerName={providerName}
                providerId={providerId}
                showLogoWithText={clusterKeys.length === 1}
                key={`${providerId}${i}`}
              />
            )
          })}
        </FlexBox>
        <RegionDropdown />
      </FlexBox>
      <div className="region-info">
        Don't see the region you need?{' '}
        <SafeBlankLink href="https://www.influxdata.com/influxdb-cloud-2-0-provider-region/">
          Let us know
        </SafeBlankLink>
        .
      </div>
    </FlexBox>
  )
}
