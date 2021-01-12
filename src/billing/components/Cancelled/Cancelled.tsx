import React, {FC, useEffect} from 'react'
import {
  FlexDirection,
  FlexBox,
  ComponentSize,
  AlignItems,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

import PlanTypePanel from 'src/billing/components/PayAsYouGo/PlanTypePanel'
import PaymentPanel from 'src/billing/components/PaymentInfo/PaymentPanel'
import BillingContactInfo from 'src/billing/components/BillingContactInfo'
import InvoiceHistory from 'src/billing/components/PayAsYouGo/InvoiceHistory'
import {useBilling} from 'src/billing/components/BillingPage'
import {getInvoices, getPaymentMethods, getRegion} from 'src/billing/thunks'
import {RemoteDataState} from 'src/types'

const BillingCancelled: FC = () => {
  const [state, dispatch] = useBilling()

  useEffect(() => {
    getInvoices(dispatch)
    getRegion(dispatch)
    getPaymentMethods(dispatch)
  }, [dispatch])

  const invoiceLoading = state?.invoicesStatus ?? RemoteDataState.NotStarted
  const regionLoading = state?.region?.status
    ? state?.region?.status
    : RemoteDataState.NotStarted
  const paymentMethodLoading =
    state?.paymentMethodsStatus ?? RemoteDataState.NotStarted

  return (
    <FlexBox
      direction={FlexDirection.Column}
      alignItems={AlignItems.Stretch}
      margin={ComponentSize.Small}
    >
      <SpinnerContainer
        spinnerComponent={<TechnoSpinner />}
        loading={regionLoading}
      >
        <PlanTypePanel />
      </SpinnerContainer>
      <SpinnerContainer
        spinnerComponent={<TechnoSpinner />}
        loading={invoiceLoading}
      >
        <InvoiceHistory />
      </SpinnerContainer>
      <SpinnerContainer
        spinnerComponent={<TechnoSpinner />}
        loading={paymentMethodLoading}
      >
        <PaymentPanel />
      </SpinnerContainer>
      <BillingContactInfo />
    </FlexBox>
  )
}

export default BillingCancelled
