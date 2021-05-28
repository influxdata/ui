import React, {FC, ReactChild, useEffect, useContext} from 'react'

// Components
import {BillingContext} from 'src/billing/context/billing'
import PageSpinner from 'src/perf/components/PageSpinner'

type Props = {
  children: ReactChild
}

const BillingInfoWrapper: FC<Props> = ({children}) => {
  const {handleGetBillingInfo, billingInfoStatus} = useContext(BillingContext)

  useEffect(() => {
    handleGetBillingInfo()
  }, [handleGetBillingInfo])

  return <PageSpinner loading={billingInfoStatus}>{children}</PageSpinner>
}

export default BillingInfoWrapper
