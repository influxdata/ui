// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'

// Utils
import {deleteAPI, getAllAPI} from 'src/writeData/subscriptions/context/api'

// Types
import {Subscription} from 'src/types/subscriptions'
import {RemoteDataState} from 'src/types'

export interface SubscriptionListContextType {
  getAll: () => void
  deleteSubscription: (id: string) => void
  subscriptions: Subscription[]
  loading: RemoteDataState
}

export const DEFAULT_CONTEXT: SubscriptionListContextType = {
  getAll: () => {},
  deleteSubscription: (_: string) => {},
  subscriptions: [],
  loading: RemoteDataState.NotStarted,
} as SubscriptionListContextType

export const SubscriptionListContext = React.createContext<
  SubscriptionListContextType
>(DEFAULT_CONTEXT)

export const SubscriptionListProvider: FC = ({children}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(null)
  const [loading, setLoading] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const getAll = useCallback(async (): Promise<void> => {
    setLoading(RemoteDataState.Loading)
    const data = await getAllAPI()
    if (Array.isArray(data)) {
      setSubscriptions(data)
    }
    setLoading(RemoteDataState.Done)
  }, [])
  const deleteSubscription = async (id: string): Promise<void> => {
    setLoading(RemoteDataState.Loading)
    await deleteAPI(id)
    setSubscriptions(subscriptions.filter(s => s.id !== id))
    setLoading(RemoteDataState.Done)
  }
  useEffect(() => {
    getAll()
  }, [])
  return (
    <SubscriptionListContext.Provider
      value={{
        getAll,
        subscriptions,
        deleteSubscription,
        loading,
      }}
    >
      {children}
    </SubscriptionListContext.Provider>
  )
}

export default SubscriptionListProvider
