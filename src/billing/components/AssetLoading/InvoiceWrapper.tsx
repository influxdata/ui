import React, {FC, ReactChild, useEffect, useContext} from 'react'

// Components
import {BillingContext} from 'src/billing/context/billing'
import PageSpinner from 'src/perf/components/PageSpinner'

type Props = {
  children: ReactChild
}

const InvoiceWrapper: FC<Props> = ({children}) => {
  const {handleGetInvoices, invoicesStatus} = useContext(BillingContext)
  useEffect(() => {
    handleGetInvoices()
  }, [handleGetInvoices])

  return <PageSpinner loading={invoicesStatus}>{children}</PageSpinner>
}

export default InvoiceWrapper
