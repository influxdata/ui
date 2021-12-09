import React, {FC, useContext} from 'react'
import {BillingContext} from 'src/billing/context/billing'

const PaymentDisplay: FC = () => {
  const {
    billingInfo: {paymentMethod},
  } = useContext(BillingContext)

  return (
    <div data-testid="payment-display">
      <p>
        Your current payment card is {paymentMethod?.cardType}{' '}
        <strong>{paymentMethod?.cardNumber}</strong> &mdash; Expiring{' '}
        <strong>
          {paymentMethod?.expirationMonth}/{paymentMethod?.expirationYear}
        </strong>
      </p>
    </div>
  )
}

export default PaymentDisplay
