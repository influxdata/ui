// Libraries
import React, {FC, useContext} from 'react'
import moment from 'moment'

// Components
import {
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ConfirmationButton,
  FlexBox,
  IconFont,
  ResourceCard,
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'
import {SubscriptionListContext} from '../context/subscription.list'

interface Props {
  subscription: Subscription
}

const SubscriptionCard: FC<Props> = ({subscription}) => {
  const {deleteSubscription} = useContext(SubscriptionListContext)
  const timeSince = moment(subscription.updatedAt).fromNow()
  return (
    <ResourceCard
      key={`subscription-card-id--${subscription.id}`}
      testID="subscription-card"
      contextMenu={
        <FlexBox margin={ComponentSize.ExtraSmall}>
          <ConfirmationButton
            color={ComponentColor.Colorless}
            icon={IconFont.Trash_New}
            shape={ButtonShape.Square}
            size={ComponentSize.ExtraSmall}
            confirmationLabel="Yes, delete this subscription"
            onConfirm={() => deleteSubscription(subscription.id)}
            confirmationButtonText="Confirm"
            testID="context-delete-menu"
          />
        </FlexBox>
      }
    >
      <ResourceCard.Name name={subscription.name} />
      <ResourceCard.Description description={`${subscription.brokerHost}:${subscription.brokerPort}/${subscription.topic}`} />
      <ResourceCard.Meta>
      <>{subscription.status}</>
      <>Last Modified: {timeSince}</>
      </ResourceCard.Meta>
    </ResourceCard>
  )
}

export default SubscriptionCard
