import React, {FC, useContext, useState} from 'react'

import {
  Overlay,
  SlideToggle,
  InputLabel,
  ComponentSize,
  Input,
  FlexBox,
  FlexDirection,
  Form,
  AlignItems,
  Button,
  ComponentColor,
  ComponentStatus,
  InputType,
} from '@influxdata/clockface'

// Utils
import {BillingContext} from 'src/billing/context/billing'

// Constants
import {BALANCE_THRESHOLD_DEFAULT} from 'src/shared/constants'

// Types
import {BillingNotifySettings} from 'src/types/billing'

type Props = {
  isOverlayVisible: boolean
  onHideOverlay: () => void
}

const NotificationSettingsOverlay: FC<Props> = ({
  onHideOverlay,
  isOverlayVisible,
}) => {
  const {billingSettings, handleUpdateBillingSettings} = useContext(
    BillingContext
  )
  const [isNotifyActive, setIsNotifyActive] = useState(billingSettings.isNotify)
  const [balanceThreshold, setBalanceThreshold] = useState(
    billingSettings.balanceThreshold
  )

  const onSubmitThreshold = () => {
    const settings = {
      notifyEmail,
      balanceThreshold,
      isNotify: isNotifyActive,
    } as BillingNotifySettings
    handleUpdateBillingSettings(settings)
    onHideOverlay()
  }

  const [notifyEmail, setNotifyEmail] = useState(billingSettings.notifyEmail)

  const onToggleChange = () => {
    setIsNotifyActive(prevState => !prevState)
  }

  const onEmailChange = e => {
    setNotifyEmail(e.target.value)
  }

  const onBalanceThresholdChange = e => {
    setBalanceThreshold(e.target.value)
  }

  // TODO(ariel): should this be 10 or 1?
  const saveStatus =
    balanceThreshold < BALANCE_THRESHOLD_DEFAULT
      ? ComponentStatus.Disabled
      : ComponentStatus.Default

  return (
    <Overlay visible={isOverlayVisible}>
      <Overlay.Container>
        <Overlay.Header
          title="Notification Settings"
          onDismiss={onHideOverlay}
        />
        <Overlay.Body>
          <Form>
            <Form.Element label="">
              <FlexBox
                direction={FlexDirection.Row}
                alignItems={AlignItems.Center}
                margin={ComponentSize.Medium}
                stretchToFitWidth={true}
              >
                <SlideToggle
                  onChange={onToggleChange}
                  active={isNotifyActive}
                  size={ComponentSize.ExtraSmall}
                  testID="should-notify"
                />
                <InputLabel active={isNotifyActive}>
                  Send email notifications
                </InputLabel>
              </FlexBox>
            </Form.Element>
            {isNotifyActive ? (
              <>
                <Form.Element label="Email Address">
                  <Input
                    type={InputType.Text}
                    value={notifyEmail}
                    onChange={onEmailChange}
                  />
                </Form.Element>
                <Form.Element label="Send email when usage bill exceeds">
                  <Input
                    type={InputType.Number}
                    min={10}
                    value={balanceThreshold}
                    onChange={onBalanceThresholdChange}
                  />
                </Form.Element>
              </>
            ) : null}
          </Form>
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            color={ComponentColor.Primary}
            onClick={onSubmitThreshold}
            text="Save"
            size={ComponentSize.Small}
            status={saveStatus}
          />
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}

export default NotificationSettingsOverlay
