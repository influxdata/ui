// Libraries
import React, {FC, useContext} from 'react'

// Components
import EmptySubscriptionState from 'src/writeData/subscriptions/components/EmptySubscriptionState'
import SubscriptionsList from 'src/writeData/subscriptions/components/SubscriptionsList'

// Styles
// import 'src/writeData/subscriptions/components/SubscriptionsLanding.scss'

// Contexts
import {
  SubscriptionListContext,
  SubscriptionListProvider,
} from 'src/writeData/subscriptions/context/subscription.list'

const SubscriptionsLanding: FC = () => {
  const {subscriptions} = useContext(SubscriptionListContext)
  return subscriptions && subscriptions.length ? (
    <SubscriptionsList subscriptions={subscriptions} />
  ) : (
    <EmptySubscriptionState />
  )
}

SubscriptionsLanding

export default () => (
  <SubscriptionListProvider>
    <SubscriptionsLanding />
  </SubscriptionListProvider>
)
