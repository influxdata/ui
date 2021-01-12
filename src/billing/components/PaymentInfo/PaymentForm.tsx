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

// Utils
// import {useBilling} from 'src/billing/components/BillingPage'

// Types
// import {CreditCardParams} from 'src/types/billing'

interface Props {
  onSubmit: (response: any) => void
  errorMessage: string
}

const PaymentForm: FC<Props> = ({errorMessage}) => {
  // const [{creditCards}] = useBilling()

  /**
   * For context, Z is a globally defined ZuoraClient in Quartz
   * that is set when the ZuoraAPI is queried. In this case, Z serves as a
   * a hosted iframe to render a credit card form to the UI
   */
  // TODO(ariel): uncomment this when we get to define Z
  // useEffect(
  //   () => typeof Z !== 'undefined' && Z.render(creditCards, {}, onSubmit)
  // )

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
