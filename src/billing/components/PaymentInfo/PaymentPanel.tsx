// Libraries
import React, {FC, useContext, useState} from 'react'

// Components
import {Panel} from '@influxdata/clockface'
import PaymentPanelHeader from './PaymentPanelHeader'
import PaymentPanelBody from './PaymentPanelBody'
import {BillingContext} from 'src/billing/context/billing'

const PaymentPanel: FC = () => {
  const {
    billingInfo: {paymentMethod},
  } = useContext(BillingContext)

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
