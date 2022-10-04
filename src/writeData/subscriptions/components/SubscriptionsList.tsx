// Libraries
import React, {FC} from 'react'

// Components
import SubscriptionCard from 'src/writeData/subscriptions/components/SubscriptionCard'

// Types
import {Subscription} from 'src/types/subscriptions'

interface Props {
  subscriptions: Subscription[]
}

export const SubscriptionsList: FC<Props> = ({subscriptions}) => (
  <div className="subscriptions-list">
    {subscriptions.map((s, key) => (
      <SubscriptionCard key={key} subscription={s} />
    ))}
  </div>
)
