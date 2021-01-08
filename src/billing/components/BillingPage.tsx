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

  const loading = state?.account
    ? state?.account?.status
    : RemoteDataState.NotStarted

  // TODO(ariel): refactor this to match Quartz

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      <BillingPageContext.Provider value={[state, dispatch]}>
        <Page titleTag="Billing">
          <Page.Header fullWidth={false}>
            <Page.Title title="Billing" />
            {!isCancelled && (
              <RateLimitAlert
                accountType={accountType}
                limitStatuses={limitStatuses}
              />
            )}
          </Page.Header>
          <Page.Contents scrollable={true}>
            {isCancelled && <AlertStatusCancelled />}
            <BillingPageContext.Provider
              value={{ccPageParams, contact, countries, states}}
            >
              <BillingPageContents
                accountType={accountType}
                invoices={invoices}
                paymentMethods={paymentMethods}
                account={account}
                orgLimits={orgLimits}
                balanceThreshold={balanceThreshold}
                isNotify={isNotify}
                notifyEmail={notifyEmail}
                region={region}
              />
            </BillingPageContext.Provider>
          </Page.Contents>
        </Page>
        <BillingPageContents />
      </BillingPageContext.Provider>
    </SpinnerContainer>
  )
}

export default BillingPage
