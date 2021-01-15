import React, {FC, ReactNode, useEffect} from 'react'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Hooks
import {useBilling} from 'src/billing/components/BillingPage'

// Thunks
import {getBillingSettings} from 'src/billing/thunks'

// Types
import {RemoteDataState} from 'src/types'

type Props = {
  children: ReactNode
}

const BillingWrapper: FC<Props> = ({children}) => {
  const [{billingSettings}, dispatch] = useBilling()

  useEffect(() => {
    getBillingSettings(dispatch)
  }, [dispatch])

  const loading = billingSettings?.status
    ? billingSettings.status
    : RemoteDataState.NotStarted

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      {children}
    </SpinnerContainer>
  )
}

export default BillingWrapper
