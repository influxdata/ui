import React, {FC, useContext} from 'react'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

// Components
import CheckoutForm from 'src/checkout/CheckoutForm'
import SuccessOverlay from 'src/checkout/SuccessOverlay'

// Types
interface Props {
  // email: string
  // onSuccessUrl: string
}

const CheckoutV2: FC<Props> = () => {
  const {checkoutStatus, handleSetCheckoutStatus} = useContext(CheckoutContext)
  return (
    <>
      {/* <SuccessOverlay
          url={onSuccessUrl}
          visible={checkoutStatus == RemoteDataState.Done}
      />*/}
      <CheckoutForm />
    </>
  )
}

export default CheckoutV2
