import React, {FC, ReactNode, useEffect} from 'react'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Hooks
import {useBilling} from 'src/billing/components/BillingPage'

// Thunks
import {getInvoices} from 'src/billing/thunks'

// Types
import {RemoteDataState} from 'src/types'

type Props = {
  children: ReactNode
}

const InvoiceWrapper: FC<Props> = ({children}) => {
  const [{invoicesStatus}, dispatch] = useBilling()

  useEffect(() => {
    getInvoices(dispatch)
  }, [dispatch])

  const loading = invoicesStatus ?? RemoteDataState.NotStarted

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      {children}
    </SpinnerContainer>
  )
}

export default InvoiceWrapper
