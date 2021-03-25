// Libraries
import React, {FC} from 'react'
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
import CreditCardForm from 'src/shared/components/CreditCardForm'

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
      <CreditCardForm zuoraParams={zuoraParams} onSubmit={onSubmit} />
    </>
  )
}

export default PaymentForm
