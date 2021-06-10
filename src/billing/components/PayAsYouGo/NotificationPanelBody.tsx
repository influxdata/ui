import React, {FC, useContext} from 'react'

import {BillingContext} from 'src/billing/context/billing'

const NotificationPanelBody: FC = () => {
  const {billingSettings} = useContext(BillingContext)

  return (
    <>
      {billingSettings.isNotify ? (
        <p>
          Sending Notifications to {billingSettings.notifyEmail} when monthly
          usage exceeds ${billingSettings.balanceThreshold}
        </p>
      ) : (
        <p>Usage Notifications disabled</p>
      )}
    </>
  )
}

export default NotificationPanelBody
