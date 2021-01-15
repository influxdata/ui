import React, {FC} from 'react'
import {useBilling} from 'src/billing/components/BillingPage'

const PaymentDisplay: FC = () => {
  const [{paymentMethods}] = useBilling()
  const paymentMethod =
    paymentMethods.find(p => p.defaultPaymentMethod) || paymentMethods[0]
  return (
    <div data-testid="payment-display">
      <p>
        Your current payment card is {paymentMethod.cardType}{' '}
        <strong>{paymentMethod.cardNumber}</strong> &mdash; Expiring{' '}
        <strong>
          {paymentMethod.expirationMonth}/{paymentMethod.expirationYear}
        </strong>
      </p>
    </div>
  )
}

export default PaymentDisplay
