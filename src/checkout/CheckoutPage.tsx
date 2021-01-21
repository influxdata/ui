import React, {FC, useState} from 'react'
import {Formik} from 'formik'
import {
  RemoteDataState,
  Notification,
  ComponentSize,
  Gradients,
} from '@influxdata/clockface'

import {CheckoutClient} from 'src/checkout/client/checkoutClient'
import {ZuoraParams} from 'src/types/billing'

import {makeInitial, validationSchema} from 'src/checkout/utils/checkout'

// Components
import CheckoutForm from 'src/checkout/CheckoutForm'
import SuccessOverlay from 'src/checkout/SuccessOverlay'

interface Props {
  email: string
  onSuccessUrl: string
  zuoraParams: ZuoraParams
}

const CheckoutV2: FC<Props> = ({email, onSuccessUrl, zuoraParams}) => {
  const checkoutClient = new CheckoutClient()

  const [checkoutStatus, setCheckoutStatus] = useState(
    RemoteDataState.NotStarted
  )

  const completeCheckout = async formValues => {
    setCheckoutStatus(await checkoutClient.completePurchase(formValues))
  }

  return (
    <Formik
      onSubmit={completeCheckout}
      initialValues={makeInitial(email, states)}
      validationSchema={validationSchema}
    >
      <>
        <Notification
          size={ComponentSize.ExtraSmall}
          gradient={Gradients.JustPeachy}
          visible={checkoutStatus == RemoteDataState.Error}
          onDismiss={() => setCheckoutStatus(RemoteDataState.NotStarted)}
        >
          There was an error submitting the upgrade request, please try again.
        </Notification>
        <SuccessOverlay
          url={onSuccessUrl}
          visible={checkoutStatus == RemoteDataState.Done}
        />
        <CheckoutForm zuoraParams={zuoraParams} />
      </>
    </Formik>
  )
}

export default CheckoutV2
