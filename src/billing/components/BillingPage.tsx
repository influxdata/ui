// Libraries
import React, {useContext, useReducer, Dispatch, useEffect} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import PageSpinner from 'src/perf/components/PageSpinner'
import BillingPageContents from 'src/billing/components/BillingPageContents'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
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

// Types
import {RemoteDataState} from 'src/types'

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

  return (
    <PageSpinner loading={loading}>
      <BillingPageContext.Provider value={[state, dispatch]}>
        <Page titleTag="Billing">
          <Page.Header fullWidth={false} testID="billing-page--header">
            <Page.Title title="Billing" />
            <LimitChecker>
              <RateLimitAlert />
            </LimitChecker>
          </Page.Header>
          <Page.Contents
            scrollable={true}
            testID="billing-page-contents--scroll"
          >
            <BillingPageContents />
          </Page.Contents>
        </Page>
      </BillingPageContext.Provider>
    </PageSpinner>
  )
}

export default BillingPage
