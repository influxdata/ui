// Libraries
import React, {FC, useState} from 'react'
// import axios from 'axios'

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

  const onSubmit = (response: ZuoraResponse): void => {
    const error = 'Could not add card, please try again.'
    if (response?.success) {
      try {
        // const url = 'privateAPI/billing/payment_method'
        // const {data} = await axios.put(url, {
        //   paymentMethodId: response.refId,
        // })
        onCancel()
        setErrorMessage('')
        // this.setState({
        //   paymentMethods: data,
        // })
      } catch (_e) {
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
