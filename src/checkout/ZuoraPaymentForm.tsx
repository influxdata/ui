import React, {FC, useContext, useEffect, useRef} from 'react'
import {ZuoraClient} from 'src/types/billing'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

export const ZUORA_ID = 'zuora_payment'

const ZuoraPaymentForm: FC = () => {
  const {zuoraParams, handleSetInputs, handleSubmit} = useContext(
    CheckoutContext
  )
  const client: ZuoraClient = window?.Z

  const onSuccess = (paymentMethodId: string) => {
    handleSetInputs('paymentMethodId', paymentMethodId)
    handleSubmit()
  }

  const callback = useRef(onSuccess)
  callback.current = onSuccess

  // const windowBlurred = useCallback(
  //   event => {
  //     if (event.target !== window) {
  //       return
  //     }

  //     // in FireFox the iframe is not yet the active element when the blur event first fires
  //     // we use setTimeout with no delay to check on the next event cycle when it will have
  //     // become the active element
  //     setTimeout(() => {
  //       if (document.activeElement.parentElement.id === ZUORA_ID) {
  //         // onFocus()
  //       }
  //     })
  //   },
  //   []
  // )

  useEffect(() => {
    if (client) {
      client.render(zuoraParams, {}, response => {
        if (response.success) {
          callback.current(response.refId)
        }
      })
    }
  }, [client, zuoraParams])

  // useEffect(() => {
  //   if (onFocus) {
  //     window.addEventListener('blur', windowBlurred, true)
  //   }

  //   return () => {
  //     if (onFocus) {
  //       window.removeEventListener('blur', windowBlurred)
  //     }
  //   }
  // }, [onFocus, windowBlurred])

  return (
    <div
      id={ZUORA_ID}
      className="billing-form--frame v2-zuora-form"
      data-testid="payment-form"
    />
  )
}

export default ZuoraPaymentForm
