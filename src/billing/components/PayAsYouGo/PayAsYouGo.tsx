import React, {FC, useEffect} from 'react'
import {
  FlexDirection,
  FlexBox,
  ComponentSize,
  AlignItems,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'

import PlanTypePanel from './PlanTypePanel'
import StoredPaymentMethod from 'src/billing/components/PaymentInfo/StoredPaymentMethod'
import CancellationPanel from './CancellationPanel'
import BillingContactInfo from 'src/billing/components/BillingContactInfo'
import BillingPageContext from 'src/billing/components/BillingPageContext'
import NotificationPanel from './NotificationPanel'
import InvoiceHistory from './InvoiceHistory'
import {useBilling} from 'src/billing/components/BillingPage'
import {getBillingSettings, getInvoices, getRegion} from 'src/billing/thunks'

const BillingPayAsYouGo: FC = () => {
  const [state, dispatch] = useBilling()

  useEffect(() => {
    getInvoices(dispatch)
    getRegion(dispatch)
    getBillingSettings(dispatch)
  }, [dispatch])

  const invoiceLoading = state?.invoicesStatus ?? RemoteDataState.NotStarted
  const regionLoading = state?.region?.status
    ? state?.region?.status
    : RemoteDataState.NotStarted
  const billingLoading = state?.billingSettings?.status
    ? state?.billingSettings?.status
    : RemoteDataState.NotStarted

  // static contextType = BillingPageContext
  // render() {
  //   const {
  //     region,
  //     account,
  //     invoices,
  //     paymentMethods,
  //     balanceThreshold,
  //     isNotify,
  //     notifyEmail,
  //   } = this.props
  //   const {contact, countries, states, ccPageParams} = this.context

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
      {/* <StoredPaymentMethod
        paymentMethods={paymentMethods}
        hostedPage={ccPageParams}
      />
      <BillingContactInfo
        countries={countries}
        states={states}
        contact={contact}
        hide={false}
      /> */}
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
