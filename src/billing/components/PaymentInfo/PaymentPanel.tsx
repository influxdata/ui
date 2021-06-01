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
    handleUpdatePaymentMethod,
  } = useContext(BillingContext)

  const [isEditing, setIsEditing] = useState(paymentMethod === null)

  const hasExistingPayment = paymentMethod !== null

  const onEdit = (): void => {
    setIsEditing(true)
  }

  const onCancel = (): void => {
    setIsEditing(false)
  }

  const onSubmit = async (paymentMethodId: string): Promise<void> => {
    try {
      await handleUpdatePaymentMethod(paymentMethodId)
      onCancel()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Panel className="checkout-panel payment-method-panel">
      <PaymentPanelHeader
        onEdit={onEdit}
        onCancel={onCancel}
        isEditing={isEditing}
        hasExistingPayment={hasExistingPayment}
      />
      <PaymentPanelBody isEditing={isEditing} onSubmit={onSubmit} />
    </Panel>
  )
}

export default PaymentPanel
