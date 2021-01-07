// Libraries
import React, {FC} from 'react'

// Components
import {Panel} from '@influxdata/clockface'
import PaymentPanelHeader from './PaymentPanelHeader'
import PaymentPanelBody from './PaymentPanelBody'

// Types
import {PaymentSummary, ZuoraParams, ZuoraResponse} from 'js/types'

interface Props {
  className?: string
  paymentSummary: PaymentSummary
  cardMessage: string
  isEditing: boolean
  hasExistingPayment: boolean
  errorMessage: string
  hostedPage: ZuoraParams
  onEdit: () => void
  onCancel: () => void
  onSubmit: (response: ZuoraResponse) => Promise<void>
  footer?: () => JSX.Element
}

const PaymentPanel: FC<Props> = ({
  className = 'payment-method-panel',
  cardMessage,
  onEdit,
  onCancel,
  footer,
  paymentSummary,
  hasExistingPayment,
  isEditing,
  errorMessage,
  hostedPage,
  onSubmit,
}) => {
  return (
    <Panel className={className}>
      <PaymentPanelHeader
        onEdit={onEdit}
        onCancel={onCancel}
        isEditing={isEditing}
        hasExistingPayment={hasExistingPayment}
      />
      <PaymentPanelBody
        paymentSummary={paymentSummary}
        cardMessage={cardMessage}
        isEditing={isEditing}
        errorMessage={errorMessage}
        hostedPage={hostedPage}
        onSubmit={onSubmit}
      />
      {footer && footer()}
    </Panel>
  )
}

export default PaymentPanel
