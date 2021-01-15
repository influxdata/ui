import React, {FC} from 'react'

import {
  Panel,
  Button,
  ComponentColor,
  ComponentSize,
} from '@influxdata/clockface'

interface Props {
  isEditing: boolean
  hasExistingPayment: boolean
  onEdit: () => void
  onCancel: () => void
}
const PaymentPanelHeader: FC<Props> = ({
  isEditing,
  onEdit,
  onCancel,
  hasExistingPayment,
}) => {
  return (
    <Panel.Header size={ComponentSize.Large}>
      <h4>Payment Method</h4>
      <PaymentPanelHeaderButton
        isEditing={isEditing}
        hasExistingPayment={hasExistingPayment}
        onEdit={onEdit}
        onCancel={onCancel}
      />
    </Panel.Header>
  )
}

interface ButtonProps {
  isEditing: boolean
  hasExistingPayment: boolean
  onEdit: () => void
  onCancel: () => void
}

const PaymentPanelHeaderButton: FC<ButtonProps> = ({
  isEditing,
  hasExistingPayment,
  onEdit,
  onCancel,
}) => {
  if (!isEditing) {
    return (
      <Button
        color={ComponentColor.Default}
        onClick={onEdit}
        text="Change Payment"
        size={ComponentSize.Small}
        testID="edit-button"
      />
    )
  }

  if (hasExistingPayment) {
    return (
      <Button
        color={ComponentColor.Default}
        onClick={onCancel}
        text="Cancel Change"
        size={ComponentSize.Small}
        testID="cancel-button"
      />
    )
  }

  return null
}

export default PaymentPanelHeader
