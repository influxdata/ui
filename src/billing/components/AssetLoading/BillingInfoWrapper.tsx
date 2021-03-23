import React, {FC, ReactNode, useEffect} from 'react'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Hooks
import {useBilling} from 'src/billing/components/BillingPage'

// Thunks
import {getBillingInfo} from 'src/billing/thunks'

// Types
import {RemoteDataState} from 'src/types'

type Props = {
  children: ReactNode
}

const BillingInfoWrapper: FC<Props> = ({children}) => {
  const [{billingInfo}, dispatch] = useBilling()

  useEffect(() => {
    getBillingInfo(dispatch)
  }, [dispatch])

  const loading = billingInfo?.status ?? RemoteDataState.NotStarted

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      {children}
    </SpinnerContainer>
  )
}

export default BillingInfoWrapper
