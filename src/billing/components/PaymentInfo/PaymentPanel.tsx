// Libraries
import React, {FC, useState} from 'react'

// Components
import {Panel} from '@influxdata/clockface'
import PaymentPanelHeader from './PaymentPanelHeader'
import PaymentPanelBody from './PaymentPanelBody'

// Types
import {useBilling} from 'src/billing/components/BillingPage'

const PaymentPanel: FC = () => {
  const [
    {
      billingInfo: {paymentMethod},
    },
  ] = useBilling()

  const [isEditing, setIsEditing] = useState(paymentMethod === null)

  const hasExistingPayment = paymentMethod !== null

  const onEdit = (): void => {
    setIsEditing(true)
  }

  const onCancel = (): void => {
    setIsEditing(false)
  }

  return (
    <Panel className="checkout-panel payment-method-panel">
      <PaymentPanelHeader
        onEdit={onEdit}
        onCancel={onCancel}
        isEditing={isEditing}
        hasExistingPayment={hasExistingPayment}
      />
      <PaymentPanelBody isEditing={isEditing} onCancel={onCancel} />
    </Panel>
  )
}

export default PaymentPanel
