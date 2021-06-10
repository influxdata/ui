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
            <BillingLoadingWrapper>
              <NotificationPanelBody />
            </BillingLoadingWrapper>
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
