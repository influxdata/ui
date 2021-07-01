import React, {FC, useState} from 'react'

import {
  Panel,
  ComponentSize,
  Button,
  ComponentColor,
} from '@influxdata/clockface'
import NotificationSettingsOverlay from 'src/billing/components/PayAsYouGo/NotificationSettingsOverlay'
import NotificationPanelBody from 'src/billing/components/PayAsYouGo/NotificationPanelBody'
import BillingLoadingWrapper from 'src/billing/components/AssetLoading/BillingWrapper'

const NotificationPanel: FC = () => {
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
        <Panel.Header testID="notification-settings--header">
          <h4>Notification Settings</h4>
          <Button
            color={ComponentColor.Default}
            onClick={handleShowOverlay}
            text="Notification Settings"
            size={ComponentSize.Small}
            testID="notification-settings--button"
          />
        </Panel.Header>
        <Panel.Body>
          <div className="billing-notification">
            <BillingLoadingWrapper>
              <NotificationPanelBody />
            </BillingLoadingWrapper>
          </div>
        </Panel.Body>
      </Panel>
      {isOverlayVisible && (
        <NotificationSettingsOverlay onHideOverlay={handleHideOverlay} />
      )}
    </>
  )
}

export default NotificationPanel
