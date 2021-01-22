import React, {FC} from 'react'

// Components
import CheckoutForm from 'src/checkout/CheckoutForm'
import SuccessOverlay from 'src/checkout/SuccessOverlay'
import CheckoutProvider from 'src/checkout/context/checkout'

// Types
interface Props {
  // email: string
  // onSuccessUrl: string
}

const CheckoutV2: FC<Props> = () => {
  return (
    <CheckoutProvider>
      {/* <SuccessOverlay
          url={onSuccessUrl}
          visible={checkoutStatus == RemoteDataState.Done}
      />*/}
      <CheckoutForm />
    </CheckoutProvider>
  )
}

export default CheckoutV2
