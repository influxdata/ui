import React, {FC, ReactNode, useEffect} from 'react'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Hooks
import {useBilling} from 'src/billing/components/BillingPage'

// Thunks
import {getRegion} from 'src/billing/thunks'

// Types
import {RemoteDataState} from 'src/types'

type Props = {
  children: ReactNode
}

const RegionWrapper: FC<Props> = ({children}) => {
  const [{region}, dispatch] = useBilling()

  useEffect(() => {
    getRegion(dispatch)
  }, [dispatch])

  const loading = region?.status ? region.status : RemoteDataState.NotStarted

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      {children}
    </SpinnerContainer>
  )
}

export default RegionWrapper
