import React, {FC} from 'react'

// Components
import {CheckoutForm} from 'src/checkout/CheckoutForm'
import SuccessOverlay from 'src/checkout/SuccessOverlay'
import {CheckoutProvider} from 'src/checkout/context/checkout'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import ZuoraOutagePage from 'src/shared/components/zuora/ZuoraOutagePage'

const CheckoutV2: FC = () => (
  <CheckoutProvider>
    <>
      <SuccessOverlay />
      {isFlagEnabled('quartzZuoraDisabled') ? (
        <ZuoraOutagePage />
      ) : (
        <CheckoutForm />
      )}
    </>
  </CheckoutProvider>
)

export default CheckoutV2
