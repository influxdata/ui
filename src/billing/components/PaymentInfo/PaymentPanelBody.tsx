// Libraries
import React, {FC, useContext, useEffect, useState} from 'react'

// Components
import {Panel, ComponentSize} from '@influxdata/clockface'
import PaymentDisplay from 'src/billing/components/PaymentInfo/PaymentDisplay'
import PaymentForm from 'src/billing/components/PaymentInfo/PaymentForm'
import {BillingContext} from 'src/billing/context/billing'

// Types
import {getErrorMessage} from 'src/utils/api'

interface Props {
  isEditing: boolean
  onCancel: () => void
}

const PaymentPanelBody: FC<Props> = ({isEditing, onCancel}) => {
  const {
    handleGetZuoraParams,
    handleUpdatePaymentMethod,
    zuoraParams,
  } = useContext(BillingContext)
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (paymentMethodId: string): Promise<void> => {
    // TODO(ariel): refactor this to be in the context
    try {
      await handleUpdatePaymentMethod(paymentMethodId)
      onCancel()
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    }
  }

  useEffect(() => {
    handleGetZuoraParams()
  }, [handleGetZuoraParams])

  if (isEditing) {
    return (
      <Panel.Body size={ComponentSize.Large}>
        <PaymentForm
          zuoraParams={zuoraParams}
          onSubmit={onSubmit}
          errorMessage={errorMessage}
        />
      </Panel.Body>
    )
  }

  return (
    <Panel.Body size={ComponentSize.Large}>
      <PaymentDisplay />
    </Panel.Body>
  )
}

export default PaymentPanelBody
