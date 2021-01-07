// Libraries
import React, {useContext, useReducer, Dispatch, useEffect} from 'react'

// Components
import {
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
  console.log({state})
  useEffect(() => {
    getAccount(dispatch)
  }, [dispatch])

  const loading = state?.account
    ? state?.account?.status
    : RemoteDataState.NotStarted

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      <BillingPageContext.Provider value={[state, dispatch]}>
        <BillingPageContents />
      </BillingPageContext.Provider>
    </SpinnerContainer>
  )
}

export default BillingPage
