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
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import AlertStatusCancelled from 'src/billing/components/Usage/AlertStatusCancelled'
import LimitChecker from 'src/cloud/components/LimitChecker'

// Reducers
import {
  BillingState,
  Action,
  billingReducer,
  BillingReducer,
  initialState,
} from 'src/billing/reducers'

// Thunks
import {getAccount} from 'src/billing/thunks'

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
  }, [dispatch])

  const loading = state?.account?.status
    ? state.account?.status
    : RemoteDataState.NotStarted

  const isCancelled = state?.account && state.account?.type === 'cancelled'

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      <BillingPageContext.Provider value={[state, dispatch]}>
        <Page titleTag="Billing">
          <Page.Header fullWidth={false} testID="billing-page--header">
            <Page.Title title="Billing" />
            <LimitChecker>{!isCancelled && <RateLimitAlert />}</LimitChecker>
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
