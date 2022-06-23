// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'

// Utils
import {deleteAPI, getAllAPI} from 'src/writeData/subscriptions/context/api'
import {notify} from 'src/shared/actions/notifications'
import {
  subscriptionsDeleteFail,
  subscriptionsGetFail,
} from 'src/shared/copy/notifications'

// Types
import {Subscription} from 'src/types/subscriptions'
import {RemoteDataState} from 'src/types'

export interface SubscriptionListContextType {
  getAll: () => void
  deleteSubscription: (id: string) => void
  subscriptions: Subscription[]
  loading: RemoteDataState
  currentID: string | null
  change: (id: string) => void
}

export const DEFAULT_CONTEXT: SubscriptionListContextType = {
  getAll: () => {},
  deleteSubscription: (_: string) => {},
  subscriptions: [],
  loading: RemoteDataState.NotStarted,
  change: (_id: string) => {},
  currentID: null,
} as SubscriptionListContextType

export const SubscriptionListContext = React.createContext<
  SubscriptionListContextType
>(DEFAULT_CONTEXT)

export const SubscriptionListProvider: FC = ({children}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(null)
  const [currentID, setCurrentID] = useState(DEFAULT_CONTEXT.currentID)
  const [loading, setLoading] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const dispatch = useDispatch()
  const getAll = useCallback(async (): Promise<void> => {
    setLoading(RemoteDataState.Loading)
    try {
      const data = await getAllAPI()
      if (Array.isArray(data)) {
        setSubscriptions(data)
      }
    } catch (err) {
      dispatch(notify(subscriptionsGetFail()))
    } finally {
      setLoading(RemoteDataState.Done)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const deleteSubscription = async (id: string): Promise<void> => {
    setLoading(RemoteDataState.Loading)
    try {
      await deleteAPI(id)
      setSubscriptions(subscriptions.filter(s => s.id !== id))
    } catch (err) {
      dispatch(notify(subscriptionsDeleteFail()))
    } finally {
      setLoading(RemoteDataState.Done)
    }
  }
  const change = useCallback(
    async (id: string): Promise<void> => {
      setLoading(RemoteDataState.Loading)
      if (!subscriptions) {
        await getAll()
      }
      setCurrentID(id)
      setLoading(RemoteDataState.Done)
    },
    [setCurrentID, subscriptions] // eslint-disable-line react-hooks/exhaustive-deps
  )
  useEffect(() => {
    getAll()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <SubscriptionListContext.Provider
      value={{
        getAll,
        subscriptions,
        deleteSubscription,
        loading,
        currentID,
        change,
      }}
    >
      {children}
    </SubscriptionListContext.Provider>
  )
}

export default SubscriptionListProvider
