// Libraries
import React, {FC} from 'react'

// Components
import {
  FlexBox,
  JustifyContent,
  AlignItems,
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
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'

interface Props {
  currentSubscription: Subscription
  setStatus: (any) => void
}

const StatusHeader: FC<Props> = ({currentSubscription, setStatus}) => (
  <FlexBox
    justifyContent={JustifyContent.SpaceBetween}
    alignItems={AlignItems.FlexEnd}
    stretchToFitHeight={true}
  >
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
    ) && (
      <ReflessPopover
        position={PopoverPosition.Below}
        showEvent={PopoverInteraction.Hover}
        hideEvent={PopoverInteraction.Hover}
        style={{width: 'max-content'}}
        contents={() => <>cannot start flow in errored state</>}
      >
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
      </ReflessPopover>
    )}
  </FlexBox>
)

export default StatusHeader
