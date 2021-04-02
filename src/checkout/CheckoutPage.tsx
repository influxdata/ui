import React, {FC} from 'react'

// Components
import CheckoutForm from 'src/checkout/CheckoutForm'
import SuccessOverlay from 'src/checkout/SuccessOverlay'
import CheckoutProvider from 'src/checkout/context/checkout'

const CheckoutV2: FC = () => {
  return (
    <CheckoutProvider>
      <>
        <SuccessOverlay />
        <CheckoutForm />
      </>
    </CheckoutProvider>
  )
}

export default CheckoutV2
