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
import {event} from 'src/cloud/utils/reporting'

// Types
import {Subscription} from 'src/types/subscriptions'
import {RemoteDataState} from 'src/types'
import {SubscriptionStatus} from 'src/client/subscriptionsRoutes'
import {getBulletinsFromStatus} from '../utils/form'

export interface SubscriptionListContextType {
  getAll: () => void
  deleteSubscription: (id: string) => void
  subscriptions: Subscription[]
  loading: RemoteDataState
  currentID: string | null
  change: (id: string) => void
  bulletins: BulletinsMap
}

export const DEFAULT_CONTEXT: SubscriptionListContextType = {
  getAll: () => {},
  deleteSubscription: (_: string) => {},
  subscriptions: [],
  loading: RemoteDataState.NotStarted,
  change: (_id: string) => {},
  currentID: null,
  bulletins: {},
} as SubscriptionListContextType

export const SubscriptionListContext =
  React.createContext<SubscriptionListContextType>(DEFAULT_CONTEXT)

export interface Bulletin {
  timestamp: number
  message: string
}

interface BulletinsMap {
  [key: string]: Bulletin[]
}

export const SubscriptionListProvider: FC = ({children}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(null)
  const [statuses, setStatuses] = useState<SubscriptionStatus[]>([])
  const [bulletins, setBulletins] = useState<BulletinsMap>({})
  const [currentID, setCurrentID] = useState(DEFAULT_CONTEXT.currentID)
  const [loading, setLoading] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const dispatch = useDispatch()
  const getAllSubsStatuses = useCallback(async (): Promise<void> => {
    setLoading(RemoteDataState.Loading)
    try {
      const allStatuses = await getAllStatuses()
      setStatuses(allStatuses)
    } catch (err) {
      dispatch(notify(subscriptionStatusesGetFail()))
    } finally {
      setLoading(RemoteDataState.Done)
    }
  }, [])

  useEffect(() => {
    if (!statuses.length) {
      return
    }

    const newBulletins = {}
    for (let i = 0; i < statuses.length; i++) {
      const item = statuses[i]
      if (item?.id) {
        newBulletins[item.id] = getBulletinsFromStatus(item)
      }
    }

    setBulletins(newBulletins)
  }, [statuses])

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
      event('subscription deletion success', {}, {feature: 'subscriptions'})
    } catch (err) {
      dispatch(notify(subscriptionsDeleteFail()))
      event(
        'subscription deletion failure',
        {err: err.message},
        {feature: 'subscriptions'}
      )
    } finally {
      setLoading(RemoteDataState.Done)
      event('subscription deletion attempt', {}, {feature: 'subscriptions'})
    }
  }
  const change = useCallback(
    (id: string) => {
      if (subscriptions) {
        setCurrentID(id)
      }
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
        deleteSubscription,
        loading,
        currentID,
        change,
        bulletins,
      }}
    >
      {children}
    </SubscriptionListContext.Provider>
  )
}

export default SubscriptionListProvider
