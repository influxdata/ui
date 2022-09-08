import React, {FC, ReactChild, useEffect, useContext} from 'react'

// Components
import {BillingContext} from 'src/billing/context/billing'
import PageSpinner from 'src/perf/components/PageSpinner'

type Props = {
  children: ReactChild
}

const BillingWrapper: FC<Props> = ({children}) => {
  const {handleGetBillingSettings, billingSettingsStatus} =
    useContext(BillingContext)

  useEffect(() => {
    handleGetBillingSettings()
  }, [handleGetBillingSettings])

  return <PageSpinner loading={billingSettingsStatus}>{children}</PageSpinner>
}

export default BillingWrapper
