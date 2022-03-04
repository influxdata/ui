// Libraries
import React, {FC} from 'react'

// Components
import EmptySubscriptionState from './EmptySubscriptionState'

// Styles
// import 'src/writeData/subscriptions/components/SubscriptionsLanding.scss'

// Contexts
import {
  // SubscriptionListContext,
  SubscriptionListProvider,
} from 'src/writeData/subscriptions/context/subscription.list'

const SubscriptionsLanding: FC = () => {
  // const {subscriptions} = useContext(SubscriptionListContext)
  const subscriptions = null
  return subscriptions ? (
    <div>subscription page</div>
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
