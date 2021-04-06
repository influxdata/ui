// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'

// Components
import {Panel, ComponentSize} from '@influxdata/clockface'
import PaymentDisplay from './PaymentDisplay'
import PaymentForm from './PaymentForm'

// Types
import {CreditCardParams} from 'src/types/billing'
import {RemoteDataState} from 'src/types'

import {
  getBillingCreditCardParams,
  putBillingPaymentMethodId,
} from 'src/billing/api'
import {getErrorMessage} from 'src/utils/api'

interface Props {
  isEditing: boolean
  onCancel: () => void
}

const EMPTY_CREDIT_CARD_PARAMS: CreditCardParams = {
  id: '',
  tenantId: '',
  key: '',
  signature: '',
  token: '',
  style: '',
  submitEnabled: 'false',
  url: '',
  status: RemoteDataState.NotStarted,
}

const PaymentPanelBody: FC<Props> = ({isEditing, onCancel}) => {
  const [errorMessage, setErrorMessage] = useState('')
  const [creditCardParams, setCreditCardParams] = useState(
    EMPTY_CREDIT_CARD_PARAMS
  )

  const onSubmit = async (paymentMethodId: string): Promise<void> => {
    const response = await putBillingPaymentMethodId(paymentMethodId)
    if (response.status !== 200) {
      setErrorMessage(getErrorMessage(response))
    } else {
      onCancel()
      setErrorMessage('')
    }
  }

  const getCreditCardParams = useCallback(async () => {
    const response = await getBillingCreditCardParams()
    if (response.status !== 200) {
      throw new Error(getErrorMessage(response))
    }

    setCreditCardParams(response.data as CreditCardParams)
  }, [])

  useEffect(() => {
    getCreditCardParams()
  }, [getCreditCardParams])

  if (isEditing) {
    return (
      <Panel.Body size={ComponentSize.Large}>
        <PaymentForm
          zuoraParams={creditCardParams}
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
