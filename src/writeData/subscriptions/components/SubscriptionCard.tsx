// Libraries
import React, {FC, useContext, useEffect, useState} from 'react'
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
import {Subscription, SubscriptionStatus} from 'src/types/subscriptions'
import {SubscriptionListContext} from '../context/subscription.list'
import {LOAD_DATA, SUBSCRIPTIONS} from 'src/shared/constants/routes'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

interface Props {
  subscription: Subscription
  status: SubscriptionStatus
}

const sanitizeBulletin = (bulletin: string) => {
  const patterns = [
    'Connection to (.*) lost \\(or was never connected\\) and connection failed.',
  ]
  const regexObj = new RegExp(patterns.join('|'), 'i')
  const matched = bulletin.match(regexObj)

  if (!!matched.length) {
    bulletin = matched[0]
  }

  return bulletin
}

const SubscriptionCard: FC<Props> = ({subscription, status}) => {
  const history = useHistory()
  const {deleteSubscription} = useContext(SubscriptionListContext)
  const timeSince = new DateTime.fromISO(subscription.updatedAt).toRelative()
  const org = useSelector(getOrg)
  const [bulletins, setBulletins] = useState<string[]>([])

  useEffect(() => {
    if (!status?.processors?.length) {
      return
    }

    const newBulletins = Array.from<string>(
      new Set<string>(
        status.processors
          .filter(pb => !!pb.bulletins.length)
          .map(pb => pb.bulletins)
          .flat()
          .map(pb => pb.bulletin.message)
          .map(b => sanitizeBulletin(b))
      )
    )
    setBulletins(newBulletins)
  }, [status?.processors])

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
        {!!bulletins.length ? (
          <>
            <ReflessPopover
              position={PopoverPosition.Below}
              showEvent={PopoverInteraction.Hover}
              hideEvent={PopoverInteraction.Hover}
              style={{width: 'max-content'}}
              contents={() => (
                <>
                  {bulletins.map((b, i) => (
                    <div key={`BulletinIssues${i}`}>
                      {b}
                      <br />
                    </div>
                  ))}
                </>
              )}
            >
              <Label
                id="tid"
                key="tkey"
                name={`${bulletins.length} Issues`}
                color="#DC4E58"
                description={`${bulletins.length} Issues`}
              />
            </ReflessPopover>
          </>
        ) : (
          <>
            <Label
              id="tid"
              key="tkey"
              name="All Cool"
              color="#006f49"
              description="No Issues"
            />
          </>
        )}
        <>{subscription.status}</>
        <>Last Modified: {timeSince}</>
      </ResourceCard.Meta>
    </ResourceCard>
  )
}

export default SubscriptionCard
