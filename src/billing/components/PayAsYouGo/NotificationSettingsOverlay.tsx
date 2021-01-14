import React, {useState} from 'react'

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
import {useBilling} from 'src/billing/components/BillingPage'

const NotificationSettingsOverlay = ({onHideOverlay, isOverlayVisible}) => {
  const [{billingSettings}] = useBilling()
  const [isNotifyActive, setIsNotifyActive] = useState(billingSettings.isNotify)
  const [balanceThreshold, setBalanceThreshold] = useState(
    billingSettings.balanceThreshold
  )

  const onSubmitThreshold = () => {
    const payload = {
      notifyEmail,
      balanceThreshold: balanceThreshold.toString(),
      isNotify: isNotifyActive,
    }
    const url = 'privateAPI/balance_threshold'
    fetch(url, {method: 'PUT', body: JSON.stringify(payload)}).then(() => {
      onHideOverlay()
      // TODO(ariel): query the billingSettings to get the latest data in the parent
    })
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

  const saveStatus =
    balanceThreshold < 10 ? ComponentStatus.Disabled : ComponentStatus.Default

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
