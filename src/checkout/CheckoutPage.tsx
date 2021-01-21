import React, {FC, useContext} from 'react'
// import {Formik} from 'formik'
import {
  RemoteDataState,
  Notification,
  ComponentSize,
  Gradients,
} from '@influxdata/clockface'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'
// import {makeInitial, validationSchema} from 'src/checkout/utils/checkout'

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
      <Notification
        size={ComponentSize.ExtraSmall}
        gradient={Gradients.JustPeachy}
        visible={checkoutStatus == RemoteDataState.Error}
        onDismiss={() => handleSetCheckoutStatus(RemoteDataState.NotStarted)}
      >
        There was an error submitting the upgrade request, please try again.
      </Notification>
      {/* <SuccessOverlay
          url={onSuccessUrl}
          visible={checkoutStatus == RemoteDataState.Done}
        /> */}
      <CheckoutForm />
    </>
  )
}

export default CheckoutV2
