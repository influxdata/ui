// Libraries
import React, {FC, useState, useCallback, useContext, useEffect} from 'react'
import {updateAPI} from 'src/writeData/subscriptions/context/api'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'

// Types
import {RemoteDataState} from 'src/types'
import {Subscription} from 'src/types/subscriptions'
import {subscriptionUpdateFail} from 'src/shared/copy/notifications'

// Contexts

import {SubscriptionListContext} from 'src/writeData/subscriptions/context/subscription.list'

export interface SubscriptionUpdateContextType {
  update: () => void
  currentSubscription: Subscription | null
  saveForm: (subscription) => void
  updateForm: (subscription) => void
  loading: RemoteDataState
}

export const DEFAULT_CONTEXT: SubscriptionUpdateContextType = {
  update: () => {},
  saveForm: () => {},
  currentSubscription: null,
  updateForm: () => {},
  loading: RemoteDataState.NotStarted,
} as SubscriptionUpdateContextType

export const SubscriptionUpdateContext = React.createContext<
  SubscriptionUpdateContextType
>(DEFAULT_CONTEXT)

export const SubscriptionUpdateProvider: FC = ({children}) => {
  const {subscriptions, currentID} = useContext(SubscriptionListContext)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription>()
  useEffect(() => {
    setLoading(RemoteDataState.Loading)
    if (currentID && subscriptions) {
      const current = subscriptions.find(s => s.id === currentID)
      setCurrentSubscription(current)
      setLoading(RemoteDataState.Done)
    }
  }, [currentID, subscriptions])

  const [loading, setLoading] = useState(RemoteDataState.Done)
  const history = useHistory()
  const org = useSelector(getOrg)
  const dispatch = useDispatch()

  const update = (subscription?: Subscription): any => {
    setLoading(RemoteDataState.Loading)
    updateAPI({data: subscription})
      .then(() => {
        setLoading(RemoteDataState.Done)
        history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
      })
      .catch(() => {
        dispatch(notify(subscriptionUpdateFail()))
      })
  }

  const updateForm = useCallback(
    currentSubscription => {
      setCurrentSubscription(prev => ({
        ...prev,
        ...currentSubscription,
      }))
    },
    [currentSubscription] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const saveForm = (currentSubscription?: Subscription): void => {
    update(currentSubscription)
  }

  return (
    <SubscriptionUpdateContext.Provider
      value={{
        update,
        currentSubscription,
        updateForm,
        saveForm,
        loading,
      }}
    >
      {children}
    </SubscriptionUpdateContext.Provider>
  )
}

export default SubscriptionUpdateProvider
