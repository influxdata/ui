import React, {FC, ReactNode, useEffect} from 'react'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Hooks
import {useBilling} from 'src/billing/components/BillingPage'

// Thunks
import {getAccount} from 'src/billing/thunks'

// Types
import {RemoteDataState} from 'src/types'

type Props = {
  children: ReactNode
}

const AccountWrapper: FC<Props> = ({children}) => {
  const [{account}, dispatch] = useBilling()

  useEffect(() => {
    getAccount(dispatch)
  }, [dispatch])

  const loading = account?.status ?? RemoteDataState.NotStarted

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      {children}
    </SpinnerContainer>
  )
}

export default AccountWrapper
