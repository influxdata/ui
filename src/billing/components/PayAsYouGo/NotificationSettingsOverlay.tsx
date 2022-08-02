import React, {FC, useContext, useState} from 'react'

import {
  ButtonType,
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
  IconFont,
} from '@influxdata/clockface'

// Utils
import {BillingContext} from 'src/billing/context/billing'

// Constants
import {MINIMUM_BALANCE_THRESHOLD} from 'src/shared/constants'

// Types
import {BillingNotifySettings} from 'src/types/billing'

type Props = {
  onHideOverlay: () => void
}

const NotificationSettingsOverlay: FC<Props> = ({onHideOverlay}) => {
  const {billingSettings, handleUpdateBillingSettings} = useContext(
    BillingContext
  )
  const [isNotifyActive, setIsNotifyActive] = useState<boolean>(
    billingSettings.isNotify
  )
  const [balanceThreshold, setBalanceThreshold] = useState<number>(
    billingSettings.balanceThreshold ?? MINIMUM_BALANCE_THRESHOLD
  )
  const [hasThresholdError, setHasThresholdError] = useState<boolean>(false)

  const [notifyEmail, setNotifyEmail] = useState(billingSettings.notifyEmail)

  const onSubmitThreshold = e => {
    e.preventDefault()

    if (`${balanceThreshold}`.includes('.')) {
      setHasThresholdError(true)
      return
    }
    const settings: BillingNotifySettings = {
      notifyEmail,
      balanceThreshold:
        typeof balanceThreshold === 'string'
          ? parseFloat(balanceThreshold)
          : balanceThreshold,
      isNotify: isNotifyActive,
    }
    handleUpdateBillingSettings(settings)
    onHideOverlay()
  }

  const onToggleChange = () => {
    setIsNotifyActive(prevState => !prevState)
  }

  const onEmailChange = e => {
    setNotifyEmail(e.target.value)
  }

  const onBalanceThresholdChange = e => {
    if (hasThresholdError) {
      setHasThresholdError(false)
    }
    setBalanceThreshold(e.target.value)
  }

  const saveStatus =
    Number(balanceThreshold) < MINIMUM_BALANCE_THRESHOLD
      ? ComponentStatus.Disabled
      : ComponentStatus.Default

  return (
    <Overlay visible={true}>
      <Overlay.Container>
        <Overlay.Header
          title="Notification Settings"
          onDismiss={onHideOverlay}
        />
        <Form onSubmit={onSubmitThreshold}>
          <Overlay.Body>
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
                  testID="should-notify--toggle"
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
                    type={InputType.Email}
                    value={notifyEmail}
                    onChange={onEmailChange}
                  />
                </Form.Element>
                <Form.Element
                  label="Send email when usage bill exceeds"
                  errorMessage={
                    hasThresholdError && 'Please provide a whole number'
                  }
                >
                  <Input
                    icon={IconFont.CurrencyDollar}
                    type={InputType.Number}
                    min={10}
                    value={balanceThreshold}
                    onChange={onBalanceThresholdChange}
                  />
                </Form.Element>
              </>
            ) : null}
          </Overlay.Body>
          <Overlay.Footer>
            <Button
              type={ButtonType.Submit}
              color={ComponentColor.Primary}
              text="Save"
              size={ComponentSize.Small}
              status={saveStatus}
              testID="save-settings--button"
            />
          </Overlay.Footer>
        </Form>
      </Overlay.Container>
    </Overlay>
  )
}

export default NotificationSettingsOverlay
