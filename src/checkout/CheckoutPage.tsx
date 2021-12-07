import React, {FC, useEffect, useMemo} from 'react'

// Components
import CheckoutForm from 'src/checkout/CheckoutForm'
import SuccessOverlay from 'src/checkout/SuccessOverlay'
import CheckoutProvider from 'src/checkout/context/checkout'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import ZuoraOutagePage from 'src/shared/components/zuora/ZuoraOutagePage'
import {useSelector} from 'react-redux'
import {AppState} from 'src/types'
import {useHistory} from 'react-router'

const CheckoutV2: FC = () => {
  const history = useHistory()
  const accountType = useSelector(
    (state: AppState) => state.me?.quartzMe?.accountType
  )

  const shouldContinue = useMemo(() => {
    return accountType === 'free' || accountType === 'cancelled'
  }, [accountType])

  useEffect(() => {
    if (!shouldContinue) {
      history.push('/')
    }
  }, [shouldContinue])

  if (!shouldContinue) {
    return null
  }

  return (
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
}

export default CheckoutV2
