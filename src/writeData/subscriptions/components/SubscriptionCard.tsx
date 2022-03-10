// Libraries
import React, {FC} from 'react'

// Components
import {ResourceCard} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'

interface Props {
  subscription: Subscription
}

const SubscriptionCard: FC<Props> = ({subscription}) => (
  <ResourceCard
    key={`subscription-card-id--${subscription.id}`}
    testID="subscription-card"
  >
    <ResourceCard.Name name={subscription.name} />
    <ResourceCard.Description description={subscription.description} />
  </ResourceCard>
)

export default SubscriptionCard
