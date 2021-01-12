import React, {FC} from 'react'
import {useBilling} from 'src/billing/components/BillingPage'

interface Props {
  cardMessage: string
  className?: string
}

const PaymentDisplay: FC<Props> = ({className, cardMessage}) => {
  const [{paymentMethods}] = useBilling()
  const paymentMethod =
    paymentMethods.find(p => p.defaultPaymentMethod) || paymentMethods[0]
  return (
    <div className={className} data-testid="payment-display">
      <p>
        {cardMessage} {paymentMethod.cardType}{' '}
        <strong>{paymentMethod.cardNumber}</strong> &mdash; Expiring{' '}
        <strong>
          {paymentMethod.expirationMonth}/{paymentMethod.expirationYear}
        </strong>
      </p>
    </div>
  )
}

export default PaymentDisplay
