import React, {FC, useContext} from 'react'

import {BillingContext} from 'src/billing/context/billing'

const NotificationPanelBody: FC = () => {
  const {billingSettings} = useContext(BillingContext)

  return (
    <>
      {billingSettings.isNotify ? (
        <p data-testid="billing-settings--text">
          Sending Notifications to {billingSettings.notifyEmail} when monthly
          usage exceeds ${billingSettings.balanceThreshold}
        </p>
      ) : (
        <p data-testid="billing-settings--text">Usage Notifications disabled</p>
      )}
    </>
  )
}

export default NotificationPanelBody
