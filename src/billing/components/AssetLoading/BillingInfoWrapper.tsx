import React, {FC, ReactNode, useEffect, useContext} from 'react'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Components
import {BillingContext} from 'src/billing/context/billing'

// Thunks
import {getBillingInfo} from 'src/billing/thunks'

// Types
import {RemoteDataState} from 'src/types'

type Props = {
  children: ReactNode
}

const BillingInfoWrapper: FC<Props> = ({children}) => {
  const {} = useContext(BillingContext)

  // useEffect(() => {
  //   getBillingInfo(dispatch)
  // }, [dispatch])

  // const loading = billingInfo?.status ?? RemoteDataState.NotStarted

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      {children}
    </SpinnerContainer>
  )
}

export default BillingInfoWrapper
