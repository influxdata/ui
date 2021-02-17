// Libraries
import React, {FC, useState} from 'react'

// Components
import {Panel, ComponentSize} from '@influxdata/clockface'
import PaymentDisplay from './PaymentDisplay'
import PaymentForm from './PaymentForm'

// Types
import {ZuoraResponse} from 'src/types/billing'

interface Props {
  isEditing: boolean
  onCancel: () => void
}

const PaymentPanelBody: FC<Props> = ({isEditing, onCancel}) => {
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (response: ZuoraResponse): Promise<void> => {
    const error = 'Could not add card, please try again.'
    if (response?.success) {
      try {
        const url = 'privateAPI/billing/payment_method'
        const data = await fetch(url, {
          method: 'PUT',
          body: JSON.stringify({
            paymentMethodId: response.refId,
          }),
        })
        onCancel()
        setErrorMessage('')
        // TODO(ariel): refetch the updated payment methods elsewhere once this has resolved
        console.log(data) // eslint-disable-line no-console
      } catch {
        setErrorMessage(error)
      }
    } else {
      setErrorMessage(error)
    }
  }

  if (isEditing) {
    return (
      <Panel.Body size={ComponentSize.Large}>
        <PaymentForm onSubmit={onSubmit} errorMessage={errorMessage} />
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
