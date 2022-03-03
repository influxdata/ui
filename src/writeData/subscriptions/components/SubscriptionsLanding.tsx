// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Components
import EmptySubscriptionState from './EmptySubscriptionState'

// Styles
// import 'src/writeData/subscriptions/components/SubscriptionsLanding.scss'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Contexts
// import { getAllAPI } from '../context/api'

const SubscriptionsLanding: FC = () => {
  const org = useSelector(getOrg)
  console.log('id', org.id)
  // const {subscriptions} = getAllAPI(org.id)
  const subscriptions = null
  console.log('subscriptions', subscriptions)
  return subscriptions ? (
    <div>subscription page</div>
  ) : (
    <EmptySubscriptionState />
  )
}

export default SubscriptionsLanding
