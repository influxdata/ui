import React, {FC, useCallback, useContext, useEffect, useState} from 'react'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

export const ZUORA_SCRIPT_URL =
  'https://apisandboxstatic.zuora.com/Resources/libs/hosted/1.3.0/zuora-min.js'
export const ZUORA_ID = 'zuora_payment'

const ZuoraPaymentForm: FC = () => {
  const {zuoraParams, onFocus, handleSubmit, inputs} = useContext(
    CheckoutContext
  )

  const [client, setClient] = useState(window.Z)
  const [paymentMethodId, setPaymentMethodId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const windowBlurred = useCallback(
    event => {
      if (event.target !== window) {
        return
      }

      // in FireFox the iframe is not yet the active element when the blur event first fires
      // we use setTimeout with no delay to check on the next event cycle when it will have
      // become the active element
      setTimeout(() => {
        if (document.activeElement.parentElement.id === ZUORA_ID) {
          onFocus()
        }
      })
    },
    [onFocus]
  )

  useEffect(() => {
    const script = document.createElement('script')

    if (!client) {
      script.src = ZUORA_SCRIPT_URL
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        setClient(window.Z)
      }
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [client])

  useEffect(() => {
    const submitCheckout = async paymentMethodId => {
      try {
        await handleSubmit(paymentMethodId)

        // Should we have retries at all?
        setPaymentMethodId(null)
        setIsSubmitting(false)
      } catch (e) {
        console.error('ERROR: ', e)
      }
    }

    if (paymentMethodId !== null && !isSubmitting) {
      setIsSubmitting(true)
      submitCheckout(paymentMethodId)
    }
  }, [paymentMethodId, handleSubmit, inputs, isSubmitting, setIsSubmitting])

  useEffect(() => {
    if (client) {
      client.render(zuoraParams, {}, response => {
        if (response.success) {
          setPaymentMethodId(response.refId)
        }
      })
    }
  }, [client, zuoraParams])

  useEffect(() => {
    onFocus && window.addEventListener('blur', windowBlurred, true)

    return () => {
      if (onFocus) {
        window.removeEventListener('blur', windowBlurred)
      }
    }
  }, [onFocus, windowBlurred])

  return (
    <div
      id={ZUORA_ID}
      key={ZUORA_ID}
      className="billing-form--frame v2-zuora-form"
      data-testid="payment-form"
    />
  )
}

export default ZuoraPaymentForm
