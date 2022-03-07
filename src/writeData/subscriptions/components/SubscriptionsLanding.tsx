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
  // console.log('sub', subscriptions)
  const subscriptions = null
  return subscriptions && subscriptions.length ? (
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
