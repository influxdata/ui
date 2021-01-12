// Libraries
import React, {useContext, useReducer, Dispatch, useEffect} from 'react'

// Components
import {
  Page,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

import BillingPageContents from 'src/billing/components/BillingPageContents'
import RateLimitAlert from 'src/billing/components/Notifications/RateLimitAlert'
import AlertStatusCancelled from 'src/billing/components/Usage/AlertStatusCancelled'

// Reducers
import {
  BillingState,
  Action,
  billingReducer,
  BillingReducer,
  initialState,
} from 'src/billing/reducers'

// Thunks
import {getAccount, getLimitsStatus} from 'src/billing/thunks'

export const BillingPageContext = React.createContext(null)
export type BillingPageContextResult = [BillingState, Dispatch<Action>]

export const useBilling = (): BillingPageContextResult =>
  useContext(BillingPageContext)

function BillingPage() {
  const [state, dispatch] = useReducer<BillingReducer>(
    billingReducer,
    initialState()
  )

  useEffect(() => {
    getAccount(dispatch)
    getLimitsStatus(dispatch)
  }, [dispatch])

  const accountLoading = state?.account?.status
    ? state.account?.status
    : RemoteDataState.NotStarted

  const limitLoading = state?.limitsStatus?.status
    ? state.limitsStatus?.status
    : RemoteDataState.NotStarted

  const isCancelled = state?.account && state.account?.type === 'cancelled'

  return (
    <SpinnerContainer
      spinnerComponent={<TechnoSpinner />}
      loading={accountLoading}
    >
      <BillingPageContext.Provider value={[state, dispatch]}>
        <Page titleTag="Billing">
          <Page.Header fullWidth={false} testID="billing-page--header">
            <Page.Title title="Billing" />
            <SpinnerContainer
              spinnerComponent={<TechnoSpinner />}
              loading={limitLoading}
            >
              {!isCancelled && <RateLimitAlert />}
            </SpinnerContainer>
          </Page.Header>
          <Page.Contents
            scrollable={true}
            testID="billing-page-contents--scroll"
          >
            {isCancelled && <AlertStatusCancelled />}
            <BillingPageContents />
          </Page.Contents>
        </Page>
      </BillingPageContext.Provider>
    </SpinnerContainer>
  )
}

export default BillingPage
