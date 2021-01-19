import React, {FC, useState} from 'react'

import {
  Panel,
  ComponentSize,
  Button,
  ComponentColor,
} from '@influxdata/clockface'
import NotificationSettingsOverlay from 'src/billing/components/PayAsYouGo/NotificationSettingsOverlay'
import {useBilling} from 'src/billing/components/BillingPage'

const NotificationPanel: FC = () => {
  const [{billingSettings}] = useBilling()
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)

  const handleShowOverlay = () => {
    setIsOverlayVisible(true)
  }

  const handleHideOverlay = () => {
    setIsOverlayVisible(false)
  }

  return (
    <>
      <Panel testID="notification-settings">
        <Panel.Header>
          <h4>Notification Settings</h4>
          <Button
            color={ComponentColor.Default}
            onClick={handleShowOverlay}
            text="Notification Settings"
            size={ComponentSize.Small}
          />
        </Panel.Header>
        <Panel.Body>
          <div className="billing-notification">
            {billingSettings.isNotify ? (
              <p>
                Sending Notifications to {billingSettings.notifyEmail} when
                monthly usage exceeds ${billingSettings.balanceThreshold}
              </p>
            ) : (
              <p>Usage Notifications disabled</p>
            )}
          </div>
        </Panel.Body>
      </Panel>
      <NotificationSettingsOverlay
        isOverlayVisible={isOverlayVisible}
        onHideOverlay={handleHideOverlay}
      />
    </>
  )
}

export default NotificationPanel
