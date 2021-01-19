import React, {FC, ReactNode, useEffect} from 'react'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Hooks
import {useBilling} from 'src/billing/components/BillingPage'

// Thunks
import {getPaymentMethods} from 'src/billing/thunks'

// Types
import {RemoteDataState} from 'src/types'

type Props = {
  children: ReactNode
}

const PaymentMethodsWrapper: FC<Props> = ({children}) => {
  const [{paymentMethodsStatus}, dispatch] = useBilling()

  useEffect(() => {
    getPaymentMethods(dispatch)
  }, [dispatch])

  const loading = paymentMethodsStatus ?? RemoteDataState.NotStarted

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      {children}
    </SpinnerContainer>
  )
}

export default PaymentMethodsWrapper
