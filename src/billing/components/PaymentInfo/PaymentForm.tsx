// Libraries
import React, {FC, useEffect} from 'react'
import {
  Alert,
  ComponentColor,
  IconFont,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Types
import {CreditCardParams} from 'src/types/billing'

interface Props {
  zuoraParams: CreditCardParams
  onSubmit: (response: any) => void
  errorMessage: string
}

const PaymentForm: FC<Props> = ({zuoraParams, onSubmit, errorMessage}) => {
  /**
   * For context, Z is a globally defined ZuoraClient in Quartz
   * that is set when the ZuoraAPI is queried. In this case, Z serves as a
   * a hosted iframe to render a credit card form to the UI
   */
  useEffect(
    () => typeof Z !== 'undefined' && Z.render(zuoraParams, {}, onSubmit)
  )

  return (
    <>
      {errorMessage && (
        <Alert
          color={ComponentColor.Danger}
          icon={IconFont.AlertTriangle}
          className="billing-contact--alert"
        >
          {errorMessage}
        </Alert>
      )}

      <SpinnerContainer
        loading={RemoteDataState.Loading}
        spinnerComponent={<TechnoSpinner />}
        className="billing-payment--spinner"
      />
      <div
        id="zuora_payment"
        className="billing-form--frame"
        data-testid="payment-form"
      />
    </>
  )
}

export default PaymentForm
