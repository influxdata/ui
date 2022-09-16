// Libraries
import React, {FC, useContext, useEffect} from 'react'

// Components
import {Panel, ComponentSize} from '@influxdata/clockface'
import PaymentDisplay from 'src/billing/components/PaymentInfo/PaymentDisplay'
import CreditCardForm from 'src/shared/components/CreditCardForm'
import PageSpinner from 'src/perf/components/PageSpinner'
import {BillingContext} from 'src/billing/context/billing'

interface Props {
  isEditing: boolean
  onSubmit: (paymentMethodId: string) => void
}

const PaymentPanelBody: FC<Props> = ({isEditing, onSubmit}) => {
  const {handleGetZuoraParams, zuoraParams, zuoraParamsStatus} =
    useContext(BillingContext)

  useEffect(() => {
    handleGetZuoraParams()
  }, [handleGetZuoraParams])

  if (isEditing) {
    return (
      <Panel.Body size={ComponentSize.Large}>
        <PageSpinner loading={zuoraParamsStatus}>
          <CreditCardForm zuoraParams={zuoraParams} onSubmit={onSubmit} />
        </PageSpinner>
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
