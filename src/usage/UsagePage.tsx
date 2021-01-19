// Libraries
import React, {Dispatch, FC, useContext, useEffect, useReducer} from 'react'
import {
  Page,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Components
import PageSpinner from 'src/perf/components/PageSpinner'
import UsageToday from 'src/usage/UsageToday'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import AlertStatusCancelled from 'src/billing/components/Usage/AlertStatusCancelled'

// Reducers
import {
  Action,
  UsageState,
  usageReducer,
  UsageReducer,
  initialState,
} from 'src/usage/reducers'

// Thunks
import {
  getBillingDate,
  getAccount,
  getLimitsStatus,
  getHistory,
} from 'src/usage/thunks'

export const UsageContext = React.createContext(null)
export type UsageContextResult = [UsageState, Dispatch<Action>]

export const useUsage = (): UsageContextResult => useContext(UsageContext)

const Usage: FC = () => {
  const [state, dispatch] = useReducer<UsageReducer>(
    usageReducer,
    initialState()
  )

  useEffect(() => {
    getBillingDate(dispatch)
    getAccount(dispatch)
    getLimitsStatus(dispatch)
    getHistory(dispatch)
  }, [dispatch])

  const billingStartLoading = state?.billingStart?.status
    ? state.billingStart?.status
    : RemoteDataState.NotStarted

  const accountLoading = state?.account?.status
    ? state.account?.status
    : RemoteDataState.NotStarted

  const limitLoading = state?.limitsStatus?.status
    ? state.limitsStatus?.status
    : RemoteDataState.NotStarted

  const historyLoading = state?.history?.status
    ? state.history?.status
    : RemoteDataState.NotStarted

  const statuses = [historyLoading, billingStartLoading]

  let loading = RemoteDataState.NotStarted

  if (statuses.every(s => s === RemoteDataState.Done)) {
    loading = RemoteDataState.Done
  } else if (statuses.includes(RemoteDataState.Error)) {
    loading = RemoteDataState.Error
  } else if (statuses.includes(RemoteDataState.Loading)) {
    loading = RemoteDataState.Loading
  }

  const isCancelled = state?.account && state.account?.type === 'cancelled'

  return (
    <UsageContext.Provider value={[state, dispatch]}>
      <PageSpinner loading={accountLoading}>
        <Page titleTag="Usage">
          <Page.Header fullWidth={false} testID="billing-page--header">
            <Page.Title title="Usage" />
            <PageSpinner loading={limitLoading}>
              <SpinnerContainer
                spinnerComponent={<TechnoSpinner />}
                loading={limitLoading}
              >
                {!isCancelled && <RateLimitAlert />}
              </SpinnerContainer>
            </PageSpinner>
          </Page.Header>
          <Page.Contents scrollable={true}>
            {isCancelled && <AlertStatusCancelled />}
            <PageSpinner loading={loading}>
              <UsageToday />
            </PageSpinner>
          </Page.Contents>
        </Page>
      </PageSpinner>
    </UsageContext.Provider>
  )
}

export default Usage
