// Libraries
import React, {FC, useEffect, useState} from 'react'

// Components
import SubscriptionCard from 'src/writeData/subscriptions/components/SubscriptionCard'

// Types
import {Subscription, SubscriptionStatus} from 'src/types/subscriptions'

interface Props {
  subscriptions: Subscription[]
  statuses: SubscriptionStatus[]
}

interface Statuses {
  [key: string]: SubscriptionStatus
}

const SubscriptionsList: FC<Props> = ({subscriptions, statuses}) => {
  const [statusesById, setStatusesById] = useState<Statuses>(null)

  useEffect(() => {
    if (!statuses.length) {
      return
    }

    const newStatusesById = {}
    for (let i = 0; i < statuses.length; i++) {
      const item = statuses[i]
      newStatusesById[item.id] = item
    }

    setStatusesById(newStatusesById)
  }, [statuses])

  return (
    <div className="subscriptions-list">
      {subscriptions.map((s, key) => {
        return (
          <SubscriptionCard
            key={key}
            subscription={s}
            status={statusesById?.[s.id]}
          />
        )
      })}
    </div>
  )
}

export default SubscriptionsList
