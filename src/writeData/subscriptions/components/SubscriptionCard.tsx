// Libraries
import React, {FC, useContext} from 'react'
import {DateTime} from 'luxon'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

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
import {LOAD_DATA, SUBSCRIPTIONS} from 'src/shared/constants/routes'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

interface Props {
  subscription: Subscription
}

const SubscriptionCard: FC<Props> = ({subscription}) => {
  const history = useHistory()
  const {deleteSubscription} = useContext(SubscriptionListContext)
  const timeSince = new DateTime.fromISO(subscription.updatedAt).toRelative()
  const org = useSelector(getOrg)
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
            onConfirm={() => {
              event(
                'delete subscription clicked',
                {},
                {feature: 'subscriptions'}
              )
              deleteSubscription(subscription.id)
            }}
            confirmationButtonText="Confirm"
            testID="context-delete-menu"
          />
        </FlexBox>
      }
    >
      <ResourceCard.Name
        name={subscription.name}
        onClick={() => {
          event('subscription card clicked', {}, {feature: 'subscriptions'})
          history.push(
            `/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}/${subscription.id}`
          )
        }}
        testID="subscription-name"
      />
      <ResourceCard.Description
        description={`${subscription.brokerHost}:${subscription.brokerPort}/${subscription.topic}`}
      />
      <ResourceCard.Meta>
        <>{subscription.status}</>
        <>Last Modified: {timeSince}</>
      </ResourceCard.Meta>
    </ResourceCard>
  )
}

export default SubscriptionCard
