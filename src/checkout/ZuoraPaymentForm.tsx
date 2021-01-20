import React, {FC, useCallback, useEffect, useRef} from 'react'
import {ZuoraClient, ZuoraParams} from 'src/types/billing'

export interface Props {
  zuoraParams: ZuoraParams
  onSuccess: (paymentMethodId: string) => void
  client: ZuoraClient
  onFocus?: () => void
}

export const ZUORA_ID = 'zuora_payment'

const ZuoraPaymentForm: FC<Props> = ({
  client,
  zuoraParams,
  onSuccess,
  onFocus,
}) => {
  const callback = useRef(onSuccess)
  callback.current = onSuccess

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
    client.render(zuoraParams, {}, response => {
      if (response.success) {
        callback.current(response.refId)
      }
    })
  }, [client, zuoraParams])

  useEffect(() => {
    if (onFocus) {
      window.addEventListener('blur', windowBlurred, true)
    }

    return () => {
      if (onFocus) {
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

export default ZuoraPaymentForm
