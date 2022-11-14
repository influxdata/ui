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
import {Cluster} from 'src/client/unityRoutes'

// Logos
import {AWSLogoLarge} from './ProviderLogos/AWSLogoLarge'
import {AWSLogoSmall} from './ProviderLogos/AWSLogoSmall'
import {AzureLogoLarge} from './ProviderLogos/AzureLogoLarge'
import {AzureLogoSmall} from './ProviderLogos/AzureLogoSmall'
import {GCPLogoLarge} from './ProviderLogos/GCPLogoLarge'
import {GCPLogoSmall} from './ProviderLogos/GCPLogoSmall'

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
  providerMap: any
  handleSelectProvider: any
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
