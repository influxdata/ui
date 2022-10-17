// Libraries
import React, {FC, useCallback, useContext, useState} from 'react'

// Components
import {
  FlexBox,
  Heading,
  HeadingElement,
  FontWeight,
  Button,
  ComponentColor,
  ComponentStatus,
  ButtonType,
  ReflessPopover,
  PopoverPosition,
  PopoverInteraction,
  Label,
  InfluxColors,
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'
import {SubscriptionListContext} from 'src/writeData/subscriptions/context/subscription.list'
import SubscriptionErrorsOverlay from 'src/writeData/subscriptions/components/SubscriptionErrorsOverlay'

interface Props {
  currentSubscription: Subscription
  setStatus: (any) => void
  showOnLoad: boolean
}

const StatusHeader: FC<Props> = ({
  currentSubscription,
  setStatus,
  showOnLoad,
}) => {
  const {bulletins: allBulletins} = useContext(SubscriptionListContext)
  const bulletins = allBulletins?.[currentSubscription.id] ?? []
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(showOnLoad)

  const handleShowNotifications = useCallback(() => {
    setIsOverlayVisible(true)
  }, [setIsOverlayVisible])

  return (
    <>
      <FlexBox>
        <Heading
          element={HeadingElement.H3}
          weight={FontWeight.Regular}
          className="subscription-details-page__status"
        >
          Status:
          <span
            className={
              currentSubscription &&
              `subscription-details-page__status--${currentSubscription.status}`
            }
          >
            {currentSubscription && currentSubscription.status}
          </span>
        </Heading>
        {!(
          currentSubscription.status === 'VALIDATING' ||
          currentSubscription.status === 'INVALID'
        ) &&
          (currentSubscription.status !== 'ERRORED' ? (
            <Button
              text={currentSubscription.status === 'RUNNING' ? 'stop' : 'start'}
              color={
                currentSubscription.status === 'RUNNING'
                  ? ComponentColor.Danger
                  : ComponentColor.Success
              }
              onClick={() => {
                if (currentSubscription.status === 'RUNNING') {
                  setStatus(false)
                } else {
                  setStatus(true)
                }
              }}
              type={ButtonType.Submit}
              testID="subscription-details-page--status-button"
              status={
                currentSubscription.status === 'ERRORED'
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
              className="subscription-details-page__status--button"
            />
          ) : (
            <ReflessPopover
              position={PopoverPosition.Below}
              showEvent={PopoverInteraction.Hover}
              hideEvent={PopoverInteraction.Hover}
              style={{width: 'max-content'}}
              contents={() => <>cannot start flow in errored state</>}
            >
              <Button
                text="start"
                color={ComponentColor.Success}
                type={ButtonType.Submit}
                testID="subscription-details-page--status-button"
                status={ComponentStatus.Disabled}
                className="subscription-details-page__status--button"
              />
            </ReflessPopover>
          ))}
        {!!bulletins.length && (
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
            onClick={handleShowNotifications}
            testID="subscription-notifications--label"
          />
        )}
      </FlexBox>

      {isOverlayVisible && (
        <SubscriptionErrorsOverlay
          bulletins={bulletins}
          handleClose={() => setIsOverlayVisible(false)}
        />
      )}
    </>
  )
}

export default StatusHeader
