// Libraries
import React, {FC, useCallback, useContext} from 'react'
import {DateTime} from 'luxon'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ConfirmationButton,
  FlexBox,
  IconFont,
  InfluxColors,
  Label,
  ResourceCard,
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'
import {SubscriptionListContext} from '../context/subscription.list'
import {LOAD_DATA, SUBSCRIPTIONS} from 'src/shared/constants/routes'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'
import CopyToClipboard from 'src/shared/components/CopyToClipboard'
import {
  copyToClipboardFailed,
  copyToClipboardSuccess,
} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionCard.scss'

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
  const dispatch = useDispatch()

  const goToSubscriptionDetails = useCallback(() => {
    history.push(
      `/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}/${subscription.id}`
    )
  }, [history, org?.id, subscription?.id])

  const goToSubscriptionDetailsNotifications = useCallback(() => {
    history.push(
      `/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}/${subscription.id}/notifications`
    )
  }, [history, org?.id, subscription?.id])

  const handleCopyAttempt = (
    copiedText: string,
    isSuccessful: boolean
  ): void => {
    const text = copiedText.slice(0, 30).trimRight()
    const truncatedText = `${text}...`

    if (isSuccessful) {
      dispatch(notify(copyToClipboardSuccess(truncatedText, 'Subscription ID')))
    } else {
      dispatch(notify(copyToClipboardFailed(truncatedText, 'Subscription ID')))
    }
  }

  const subscriptionID = (
    <CopyToClipboard
      text={subscription.id}
      onCopy={handleCopyAttempt}
      key={subscription.id}
      data-testid="copy-subscription--component"
    >
      <span
        data-testid="copy-subscription-label"
        className="copy-subscription-id"
        title="Click to Copy to Clipboard"
      >
        ID: {subscription.id}
        <span
          data-testid="copy-subscription-button"
          className="copy-subscription-id--helper"
        >
          Copy to Clipboard
        </span>
      </span>
    </CopyToClipboard>
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
            name={`${bulletins.length} Notification${
              bulletins.length === 1 ? '' : 's'
            }`}
            color={InfluxColors.Grey25}
            description={`${bulletins.length} Notification${
              bulletins.length === 1 ? '' : 's'
            }`}
            onClick={goToSubscriptionDetailsNotifications}
            testID="subscription-notifications--label"
          />
        ) : (
          <Label
            id="tid"
            key="tkey"
            name="No Notifications"
            color={InfluxColors.Emerald}
            description="No Notifications"
            testID="subscription-notifications--label"
          />
        )}
        <>{subscription.status}</>
        <>Last Modified: {timeSince}</>
        {subscriptionID}
      </ResourceCard.Meta>
    </ResourceCard>
  )
}

export default SubscriptionCard
