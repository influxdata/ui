import React, {FC, ReactChild, useEffect, useContext} from 'react'

// Components
import {BillingContext} from 'src/billing/context/billing'
import PageSpinner from 'src/perf/components/PageSpinner'

type Props = {
  children: ReactChild
}

const MarketplaceWrapper: FC<Props> = ({children}) => {
  const {handleGetMarketplace, marketplaceStatus} = useContext(BillingContext)

  useEffect(() => {
    handleGetMarketplace()
  }, [handleGetMarketplace])

  return <PageSpinner loading={marketplaceStatus}>{children}</PageSpinner>
}

export default MarketplaceWrapper
