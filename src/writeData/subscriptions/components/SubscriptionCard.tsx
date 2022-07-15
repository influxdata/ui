// Libraries
import React, {FC, useCallback, useContext} from 'react'
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
  Label,
  PopoverInteraction,
  PopoverPosition,
  ReflessPopover,
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
  const {bulletins: allBulletins} = useContext(SubscriptionListContext)
  const bulletins = allBulletins?.[subscription.id] ?? []

  const goToSubscriptionDetails = useCallback(
    (showErrors = false) => {
      let url = `/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}/${subscription.id}`
      if (showErrors) {
        url = `${url}?e`
      }
      history.push(url)
    },
    [history, org?.id, subscription?.id]
  )

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
          goToSubscriptionDetails()
        }}
        testID="subscription-name"
      />
      <ResourceCard.Description
        description={`${subscription.brokerHost}:${subscription.brokerPort}/${subscription.topic}`}
      />
      <ResourceCard.Meta>
        {!!bulletins.length ? (
          <Label
            id="tid"
            key="tkey"
            name={`${bulletins.length} Issues`}
            color="#DC4E58"
            description={`${bulletins.length} Issues`}
            onClick={() => goToSubscriptionDetails(true)}
          />
        ) : (
          <Label
            id="tid"
            key="tkey"
            name="All Cool"
            color="#006f49"
            description="No Issues"
          />
        )}
        <>{subscription.status}</>
        <>Last Modified: {timeSince}</>
      </ResourceCard.Meta>
    </ResourceCard>
  )
}

export default SubscriptionCard
