// Libraries
import {produce} from 'immer'
// Types
import {RemoteDataState} from 'src/types'
import {BillingDate} from 'src/types/billing'

export interface UsageListState {
  billingDate: BillingDate
}

export const setBillingDateStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_BILLING_DATE_STATUS',
    status,
  } as const)

export const setBillingDate = (billingDate: BillingDate) =>
  ({
    type: 'SET_BILLING_DATE',
    billingDate,
  } as const)

export type Action =
  | ReturnType<typeof setBillingDate>
  | ReturnType<typeof setBillingDateStatus>

export const initialState = (): UsageListState => ({
  billingDate: {
    date: '01/01/1970',
    time: '00:00',
    status: RemoteDataState.NotStarted,
  },
})

export const usageReducer = (
  state: UsageListState = initialState(),
  action: Action
): UsageListState =>
  produce(state, draftState => {
    switch (action.type) {
      case 'SET_BILLING_DATE': {
        draftState.billingDate = action.billingDate

        return
      }
      case 'SET_BILLING_DATE_STATUS': {
        if (!draftState.billingDate?.status) {
          draftState.billingDate = {
            ...draftState.billingDate,
            status: action.status,
          }

          return
        }

        draftState.billingDate.status = action.status
        return
      }
    }
  })
