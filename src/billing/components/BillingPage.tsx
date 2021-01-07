// Libraries
import React, {useReducer, Dispatch, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router'

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
import {getBilling, getAccount} from 'src/billing/thunks'

export const BillingPageContext = React.createContext(null)
export type BillingPageContextResult = [BillingState, Dispatch<Action>]

function UsersPage() {
  const [state, dispatch] = useReducer<BillingReducer>(
    billingReducer,
    initialState()
  )

  useEffect(() => {
    getAccount(dispatch)
  }, [dispatch])

  const loading = state ? state?.account?.status : RemoteDataState.NotStarted

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      <BillingPageContext.Provider value={[state, dispatch]}>
        <BillingPageContents />
      </BillingPageContext.Provider>
    </SpinnerContainer>
  )
}

export default UsersPage
