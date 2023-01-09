// Library
import React, {FC, useCallback, useEffect, useRef, useState} from 'react'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Types
import {CreditCardParams, ZuoraClient} from 'src/types'

export const ZUORA_SCRIPT_URL =
  'https://static.zuora.com/Resources/libs/hosted/1.3.0/zuora-min.js'
export const ZUORA_ID = 'zuora_payment'

export interface Props {
  zuoraParams: CreditCardParams
  onSubmit?: (paymentMethodId) => void
  zuoraClient?: ZuoraClient
  onFocus?: () => void
}

const CreditCardForm: FC<Props> = ({
  zuoraParams,
  onSubmit,
  zuoraClient,
  onFocus,
}) => {
  const _isMounted = useRef(true)
  const [client, setClient] = useState(zuoraClient ?? window.Z)
  const [paymentMethodId, setPaymentMethodId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      _isMounted.current = false
    }
  }, [])

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
    if (_isMounted.current && zuoraClient && !client) {
      setClient(zuoraClient)
    }
  }, [zuoraClient, client, setClient])

  useEffect(() => {
    const script = document.createElement('script')
    const scriptId = 'ZUORA_SCRIPT_ID'

    if (!client) {
      script.id = scriptId
      script.src = ZUORA_SCRIPT_URL
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        /**
         * For context, Z is a globally defined ZuoraClient in Quartz
         * that is set when the ZuoraAPI is queried. In this case, Z serves as a
         * a hosted iframe to render a credit card form to the UI
         */
        event('zuora_form_success')
        setClient(window.Z)
      }

      script.onerror = () => {
        event('zuora_form_failure')
      }
    }
  }, [client])

  useEffect(() => {
    const submitCheckout = async paymentMethodId => {
      try {
        await onSubmit(paymentMethodId)

        // Should we have retries at all?
        setPaymentMethodId(null)
        setIsSubmitting(false)
      } catch (e) {
        console.error('ERROR: ', e)
      }
    }

    if (_isMounted.current && paymentMethodId !== null && !isSubmitting) {
      setIsSubmitting(true)
      submitCheckout(paymentMethodId)
    }
  }, [_isMounted, paymentMethodId, onSubmit, isSubmitting, setIsSubmitting])

  useEffect(() => {
    if (_isMounted.current && client) {
      client.render(zuoraParams, {}, response => {
        if (response.success) {
          setPaymentMethodId(response.refId)
        }
      })
    }
  }, [client, zuoraParams])

  useEffect(() => {
    if (!!onFocus) {
      window.addEventListener('blur', windowBlurred, true)
    }

    return () => {
      if (!!onFocus) {
        window.removeEventListener('blur', windowBlurred)
      }
    }
  }, [onFocus, windowBlurred])

  return (
    <div
      id={ZUORA_ID}
      className="billing-form--frame v2-zuora-form"
      data-testid="payment-form"
    />
  )
}

export default CreditCardForm
