// Libraries
import React, {FC} from 'react'

// Components
import {Panel, ComponentSize} from '@influxdata/clockface'
import PaymentDisplay from './PaymentDisplay'
import PaymentForm from './PaymentForm'

// Types
import {PaymentSummary, ZuoraParams, ZuoraResponse} from 'js/types'

interface Props {
  paymentSummary: PaymentSummary
  cardMessage: string
  isEditing: boolean
  errorMessage: string
  hostedPage: ZuoraParams
  onSubmit: (response: ZuoraResponse) => void
}

const PaymentPanelBody: FC<Props> = ({
  cardMessage,
  paymentSummary,
  isEditing,
  onSubmit,
  errorMessage,
  hostedPage,
}) => {
  if (isEditing) {
    return (
      <Panel.Body size={ComponentSize.Large}>
        <PaymentForm
          hostedPage={hostedPage}
          onSubmit={onSubmit}
          errorMessage={errorMessage}
        />
      </Panel.Body>
    )
  }

  return (
    <Panel.Body size={ComponentSize.Large}>
      <PaymentDisplay {...paymentSummary} cardMessage={cardMessage} />
    </Panel.Body>
  )
}

export default PaymentPanelBody
