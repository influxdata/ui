// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'

// Utils
import {getAllAPI} from 'src/writeData/subscriptions/context/api'

// Types
import {Subscription} from 'src/types/subscriptions'

export interface SubscriptionListContextType {
  getAll: () => void
  subscriptions: Subscription[]
}

export const DEFAULT_CONTEXT: SubscriptionListContextType = {
  getAll: () => {},
  subscriptions: [],
} as SubscriptionListContextType

export const SubscriptionListContext = React.createContext<
  SubscriptionListContextType
>(DEFAULT_CONTEXT)

export const SubscriptionListProvider: FC = ({children}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(null)
  const getAll = useCallback(async (): Promise<void> => {
    const data = await getAllAPI()
    if (Array.isArray(data)) {
      setSubscriptions(data)
    }
  }, [])
  useEffect(() => {
    getAll()
  }, [])
  return (
    <SubscriptionListContext.Provider
      value={{
        getAll,
        subscriptions,
      }}
    >
      {children}
    </SubscriptionListContext.Provider>
  )
}

export default SubscriptionListProvider
