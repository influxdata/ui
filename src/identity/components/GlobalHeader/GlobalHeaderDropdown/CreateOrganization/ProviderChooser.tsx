import React, {FC, useCallback, useContext} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Form,
  JustifyContent,
  SelectableCard,
} from '@influxdata/clockface'

// Style
import './ProviderChooser.scss'

// Components
import {AWSLogo} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/AWSLogo'
import {AzureLogo} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/AzureLogo'
import {ClusterBox} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ClusterBox'
import {
  CreateOrgContext,
  ProviderIDs,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/CreateOrganizationContext'
import {GCPLogo} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/GCPLogo'
import {RegionDropdown} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/RegionDropdown'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

const providerLogos = {
  AWS: <AWSLogo />,
  Azure: <AzureLogo />,
  GCP: <GCPLogo />,
}

export const ProviderChooser: FC = () => {
  const {
    changeCurrentProvider,
    changeCurrentRegion,
    clusters,
    currentProvider,
  } = useContext(CreateOrgContext)
  const clusterKeys = Object.keys(clusters)

  const handleProviderClick = useCallback(
    (providerId: ProviderIDs) => {
      if (currentProvider === providerId) {
        return
      }
      changeCurrentProvider(providerId)
      changeCurrentRegion(clusters?.[providerId]?.[0]?.regionId)
    },
    [changeCurrentProvider, changeCurrentRegion, clusters, currentProvider]
  )

  const label = 'Provider & Region'
  return (
    <FlexBox
      alignItems={AlignItems.FlexStart}
      className="provider-and-region-chooser"
      direction={FlexDirection.Column}
      justifyContent={JustifyContent.Center}
      margin={ComponentSize.Large}
      stretchToFitWidth={true}
    >
      <Form.Element htmlFor={label} label={label} className="prc-label">
        <Form.HelpText
          className="prc-description"
          text="Tell us where you would like to store the time series data for this organization."
        />
      </Form.Element>
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
          {clusterKeys.length === 1 ? (
            <ClusterBox
              providerId={clusters[clusterKeys[0]][0].providerId}
              key={`${clusters[clusterKeys[0]][0].providerId}`}
            />
          ) : (
            clusterKeys.map((providerId: ProviderIDs, i) => {
              const {providerName} = clusters[providerId][0]
              return (
                <SelectableCard
                  fontSize={ComponentSize.ExtraSmall}
                  className={`clusterbox--selectable-card ${
                    providerId === currentProvider ? 'selected' : ''
                  }`}
                  id={providerId}
                  key={`${providerId}${i}`}
                  onClick={(providerId: ProviderIDs) =>
                    handleProviderClick(providerId)
                  }
                  label={providerName}
                  selected={providerId === currentProvider}
                >
                  {providerLogos[providerId]}
                </SelectableCard>
              )
            })
          )}
        </FlexBox>
        <RegionDropdown />
      </FlexBox>
      <div className="region-info">
        <Form.HelpText text="Don't see the region you need?"></Form.HelpText>{' '}
        <SafeBlankLink href="https://www.influxdata.com/influxdb-cloud-2-0-provider-region/">
          Let us know
        </SafeBlankLink>
        <Form.HelpText text="."></Form.HelpText>
      </div>
    </FlexBox>
  )
}
