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
import {ZuoraParams, ZuoraResponse} from 'js/types'

interface Props {
  hostedPage: ZuoraParams
  onSubmit: (response: ZuoraResponse) => void
  errorMessage: string
}

const PaymentForm: FC<Props> = ({hostedPage, onSubmit, errorMessage}) => {
  useEffect(
    () => typeof Z !== 'undefined' && Z.render(hostedPage, {}, onSubmit)
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
