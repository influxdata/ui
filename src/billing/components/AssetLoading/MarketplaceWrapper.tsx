import React, {FC, ReactNode, useEffect} from 'react'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Hooks
import {useBilling} from 'src/billing/components/BillingPage'

// Thunks
import {getMarketplace} from 'src/billing/thunks'

// Types
import {RemoteDataState} from 'src/types'

type Props = {
  children: ReactNode
}

const MarketplaceWrapper: FC<Props> = ({children}) => {
  const [{marketplace}, dispatch] = useBilling()

  useEffect(() => {
    getMarketplace(dispatch)
  }, [dispatch])

  const loading = marketplace?.loadingStatus ?? RemoteDataState.NotStarted

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      {children}
    </SpinnerContainer>
  )
}

export default MarketplaceWrapper
