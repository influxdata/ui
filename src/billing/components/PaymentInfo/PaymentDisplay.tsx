import React, {FC} from 'react'

interface Props {
  cardType: string
  cardNumber: string
  expirationMonth: string
  expirationYear: string
  cardMessage: string
  className?: string
}

const PaymentDisplay: FC<Props> = ({
  cardType,
  cardNumber,
  expirationMonth,
  expirationYear,
  className,
  cardMessage,
}) => {
  return (
    <div className={className} data-testid="payment-display">
      <p>
        {cardMessage} {cardType} <strong>{cardNumber}</strong> &mdash; Expiring{' '}
        <strong>
          {expirationMonth}/{expirationYear}
        </strong>
      </p>
    </div>
  )
}

export default PaymentDisplay
