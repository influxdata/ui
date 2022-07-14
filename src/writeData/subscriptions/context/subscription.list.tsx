// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'

// Utils
import {
  deleteAPI,
  getAllAPI,
  getAllStatuses,
} from 'src/writeData/subscriptions/context/api'
import {notify} from 'src/shared/actions/notifications'
import {
  subscriptionsDeleteFail,
  subscriptionsGetFail,
  subscriptionStatusesGetFail,
} from 'src/shared/copy/notifications'

// Types
import {Subscription} from 'src/types/subscriptions'
import {RemoteDataState} from 'src/types'
import {SubscriptionStatus} from 'src/client/subscriptionsRoutes'

export interface SubscriptionListContextType {
  getAll: () => void
  deleteSubscription: (id: string) => void
  subscriptions: Subscription[]
  loading: RemoteDataState
  currentID: string | null
  change: (id: string) => void
  statuses: SubscriptionStatus[]
}

export const DEFAULT_CONTEXT: SubscriptionListContextType = {
  getAll: () => {},
  deleteSubscription: (_: string) => {},
  subscriptions: [],
  loading: RemoteDataState.NotStarted,
  change: (_id: string) => {},
  currentID: null,
  statuses: [],
} as SubscriptionListContextType

export const SubscriptionListContext = React.createContext<
  SubscriptionListContextType
>(DEFAULT_CONTEXT)

export const SubscriptionListProvider: FC = ({children}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(null)
  const [statuses, setStatuses] = useState<SubscriptionStatus[]>([])
  const [currentID, setCurrentID] = useState(DEFAULT_CONTEXT.currentID)
  const [loading, setLoading] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const dispatch = useDispatch()
  const getAllSubsStatuses = useCallback(async (): Promise<void> => {
    setLoading(RemoteDataState.Loading)
    try {
      console.log('getting statuses')
      const allStatuses = await getAllStatuses()
      console.log({allStatuses})
      setStatuses(allStatuses)
    } catch (err) {
      dispatch(notify(subscriptionStatusesGetFail()))
    } finally {
      setLoading(RemoteDataState.Done)
    }
  }, [])

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
  }, [])

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
    [setCurrentID, subscriptions]
  )

  useEffect(() => {
    getAll()
    getAllSubsStatuses()
  }, [])

  return (
    <SubscriptionListContext.Provider
      value={{
        getAll,
        subscriptions,
        statuses,
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
