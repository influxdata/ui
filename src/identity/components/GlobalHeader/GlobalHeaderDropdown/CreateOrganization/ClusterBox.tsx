// Libraries
import React, {FC, useCallback, useContext} from 'react'
import {FlexBox, FlexDirection} from '@influxdata/clockface'

// Style
import './ClusterBox.scss'

// Components
import {AWSLogoColor} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/AWSLogoColor'
import {AzureLogoWithText} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/AzureLogoWithText'
import {Cluster} from 'src/client/unityRoutes'
import {
  CreateOrgContext,
  ProviderIDs,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/CreateOrganizationContext'
import {GCPLogoWithText} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/GCPLogoWithText'

const providerLogos = {
  AWS: <AWSLogoColor className="aws-marketplace" />,
  Azure: <AzureLogoWithText />,
  GCP: <GCPLogoWithText />,
}

interface OwnProps {
  providerId: ProviderIDs
}

type Props = OwnProps & Cluster

export const ClusterBox: FC<Props> = ({providerId}) => {
  const {
    changeCurrentProvider,
    changeCurrentRegion,
    clusters,
    currentProvider,
  } = useContext(CreateOrgContext)

  const handleClick = useCallback(() => {
    if (currentProvider === providerId) {
      return
    }
    changeCurrentProvider(providerId)
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
      className="cluster-box"
      onClick={handleClick}
    >
      <div className="cluster-box-logo">{providerLogos[providerId]}</div>
    </FlexBox>
  )
}
