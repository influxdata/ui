// Libraries
import React, {FC, useCallback, useContext, useMemo} from 'react'
import classnames from 'classnames'
import {FlexBox, FlexDirection} from '@influxdata/clockface'

// Style
import './ClusterBox.scss'

// Components
import {AWSLogo} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/AWSLogo'
import {AWSLogoColor} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/AWSLogoColor'
import {AzureLogo} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/AzureLogo'
import {AzureLogoWithText} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/AzureLogoWithText'
import {Cluster} from 'src/client/unityRoutes'
import {CreateOrgContext, ProviderID} from './CreateOrganizationContext'
import {GCPLogo} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/GCPLogo'
import {GCPLogoWithText} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/GCPLogoWithText'

const providerLogos = {
  AWS: (showLogoWithText: Boolean) =>
    showLogoWithText ? (
      <AWSLogoColor className="aws-marketplace" />
    ) : (
      <AWSLogo />
    ),
  Azure: (showLogoWithText: Boolean) =>
    showLogoWithText ? <AzureLogoWithText /> : <AzureLogo />,
  GCP: (showLogoWithText: Boolean) =>
    showLogoWithText ? <GCPLogoWithText /> : <GCPLogo />,
}

interface OwnProps {
  showLogoWithText: Boolean
}

type Props = OwnProps & Cluster

export const ClusterBox: FC<Props> = ({
  providerId,
  providerName,
  showLogoWithText,
}) => {
  const {
    changeCurrentProvider,
    changeCurrentRegion,
    clusters,
    currentProvider,
  } = useContext(CreateOrgContext)
  const classes = classnames('cluster-box', {
    selected: currentProvider === providerId && !showLogoWithText,
    hoverable: !showLogoWithText,
  })

  const logo = useMemo(() => {
    return providerLogos[providerId](showLogoWithText)
  }, [providerId, showLogoWithText])

  const handleClick = useCallback(() => {
    if (currentProvider === providerId) {
      return
    }
    changeCurrentProvider(providerId as ProviderID)
    changeCurrentRegion(clusters?.[providerId]?.[0]?.regionId)
  }, [
    changeCurrentProvider,
    changeCurrentRegion,
    clusters,
    currentProvider,
    providerId,
  ])

  return (
    <FlexBox
      direction={FlexDirection.Column}
      stretchToFitWidth={true}
      className={classes}
      onClick={handleClick}
    >
      {!showLogoWithText && (
        <div className="cluster-box-title">{providerName}</div>
      )}
      <div className="cluster-box-logo">{logo}</div>
    </FlexBox>
  )
}
