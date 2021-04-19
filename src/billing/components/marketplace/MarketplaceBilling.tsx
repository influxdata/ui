import React, {FC} from 'react'

import {
  Panel,
  ComponentSize,
  FlexBox,
  FlexDirection,
  AlignItems,
  JustifyContent,
} from '@influxdata/clockface'
import MarketplaceWrapper from 'src/billing/components/AssetLoading/MarketplaceWrapper'

import MarketplaceLink from 'src/billing/components/marketplace/MarketplaceLink'
import SubscriptionManagerPanel from 'src/billing/components/marketplace/SubscriptionManagerPanel'

const MarketplaceBilling: FC = () => (
  <FlexBox
    direction={FlexDirection.Row}
    alignItems={AlignItems.Center}
    justifyContent={JustifyContent.Center}
    margin={ComponentSize.Small}
  >
    <SubscriptionManagerPanel>
      <Panel.Header size={ComponentSize.Large}>
        <h4>Subscription Management:</h4>
      </Panel.Header>
      <MarketplaceWrapper>
        <Panel.Body size={ComponentSize.Large}>
          You can manage your subscription, review billing, and find licensing
          terms on your <MarketplaceLink />
        </Panel.Body>
      </MarketplaceWrapper>
    </SubscriptionManagerPanel>
  </FlexBox>
)

export default MarketplaceBilling
