// Libraries
import React, {FC} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  SelectableCard,
} from '@influxdata/clockface'

// Types
import {Cluster, OrganizationCreateRequest} from 'src/client/unityRoutes'

// Logos
import {AWSLogoLarge} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/AWSLogoLarge'
import {AWSLogoSmall} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/AWSLogoSmall'
import {AzureLogoLarge} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization//ProviderLogos/AzureLogoLarge'
import {AzureLogoSmall} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization//ProviderLogos/AzureLogoSmall'
import {GCPLogoLarge} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization//ProviderLogos/GCPLogoLarge'
import {GCPLogoSmall} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderLogos/GCPLogoSmall'
import {ProviderMap} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/CreateOrganizationOverlay'

const providerLogosSmall = {
  AWS: <AWSLogoSmall />,
  Azure: <AzureLogoSmall />,
  GCP: <GCPLogoSmall />,
}

const providerLogosLarge = {
  AWS: <AWSLogoLarge className="aws-marketplace" />,
  Azure: <AzureLogoLarge />,
  GCP: <GCPLogoLarge />,
}

interface Props {
  providerMap: ProviderMap
  handleSelectProvider: (
    providerId: OrganizationCreateRequest['provider']
  ) => void
  currentProvider: Cluster['providerId']
}

export const ProviderCards: FC<Props> = ({
  providerMap,
  currentProvider,
  handleSelectProvider,
}) => {
  const providerNames = Object.keys(providerMap)
  const numProviders = providerNames.length

  return (
    <FlexBox alignItems={AlignItems.Stretch} stretchToFitWidth={true}>
      {numProviders === 1 ? (
        <FlexBox
          direction={FlexDirection.Column}
          stretchToFitWidth={true}
          className="create-org-overlay--provider-box"
        >
          <div className="create-org-overlay--provider-box-logo">
            {providerLogosLarge[currentProvider]}
          </div>
        </FlexBox>
      ) : (
        providerNames.map((providerId, idx) => {
          const {providerName} = providerMap[providerId][0]

          return (
            <SelectableCard
              fontSize={ComponentSize.ExtraSmall}
              className={`create-org-overlay--selectable-provider ${
                providerId === currentProvider ? 'selected' : ''
              }`}
              id={providerId}
              key={`${providerId}${idx}`}
              onClick={handleSelectProvider}
              label={providerName}
              selected={providerId === currentProvider}
            >
              {providerLogosSmall[providerId]}
            </SelectableCard>
          )
        })
      )}
    </FlexBox>
  )
}
