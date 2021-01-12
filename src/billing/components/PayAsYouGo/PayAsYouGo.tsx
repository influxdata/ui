import React, {FC, useEffect} from 'react'
import {
  FlexDirection,
  FlexBox,
  ComponentSize,
  AlignItems,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Types
import {RemoteDataState} from 'src/types'

// Components
import PlanTypePanel from 'src/billing/components/PayAsYouGo/PlanTypePanel'
import PaymentPanel from 'src/billing/components/PaymentInfo/PaymentPanel'
import BillingContactInfo from 'src/billing/components/BillingContactInfo'
import InvoiceHistory from 'src/billing/components/PayAsYouGo/InvoiceHistory'
import CancellationPanel from 'src/billing/components/PayAsYouGo/CancellationPanel'
import NotificationPanel from 'src/billing/components/PayAsYouGo/NotificationPanel'

// Utils
import {useBilling} from 'src/billing/components/BillingPage'
import {
  getBillingSettings,
  getInvoices,
  getPaymentMethods,
  getRegion,
} from 'src/billing/thunks'

const BillingPayAsYouGo: FC = () => {
  const [state, dispatch] = useBilling()

  useEffect(() => {
    getInvoices(dispatch)
    getRegion(dispatch)
    getBillingSettings(dispatch)
    getPaymentMethods(dispatch)
  }, [dispatch])

  const invoiceLoading = state?.invoicesStatus ?? RemoteDataState.NotStarted
  const regionLoading = state?.region?.status
    ? state?.region?.status
    : RemoteDataState.NotStarted
  const billingLoading = state?.billingSettings?.status
    ? state?.billingSettings?.status
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
      <SpinnerContainer
        spinnerComponent={<TechnoSpinner />}
        loading={billingLoading}
      >
        <NotificationPanel />
      </SpinnerContainer>
      <CancellationPanel />
    </FlexBox>
  )
}

export default BillingPayAsYouGo
