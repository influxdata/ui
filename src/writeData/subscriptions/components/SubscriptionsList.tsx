// Libraries
import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import SubscriptionCard from 'src/writeData/subscriptions/components/SubscriptionCard'

// Types
import {Subscription} from 'src/types/subscriptions'

interface Props {
  subscriptions: Subscription[]
}

const SubscriptionsList: FC<Props> = ({subscriptions}) => (
  <Page>
    <Page.Contents>
      {subscriptions.map((s, key) => (
        <SubscriptionCard key={key} subscription={s} />
      ))}
    </Page.Contents>
  </Page>
)

export default SubscriptionsList
