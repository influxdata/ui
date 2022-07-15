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

export const SubscriptionListContext = React.createContext<
  SubscriptionListContextType
>(DEFAULT_CONTEXT)

type Bulletin = string

interface BulletinsMap {
  [key: string]: Bulletin[]
}

const sanitizeBulletin = (bulletin: string) => {
  const patterns = [
    'Connection to (.*) lost \\(or was never connected\\) and connection failed.',
  ]
  const regexObj = new RegExp(patterns.join('|'), 'i')
  const matched = bulletin.match(regexObj)

  if (!!matched?.length) {
    bulletin = matched[0]
  }

  return bulletin
}

const getBulletinsFromStatus = status => {
  if (!status?.processors?.length) {
    return []
  }

  return Array.from<string>(
    new Set<string>(
      status.processors
        .filter(pb => !!pb.bulletins.length)
        .map(pb => pb.bulletins)
        .flat()
        .map(pb => pb.bulletin.message)
        .map(b => sanitizeBulletin(b))
    )
  )
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
      newBulletins[item.id] = getBulletinsFromStatus(item)
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
