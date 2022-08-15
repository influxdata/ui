// Libraries
import React, {FC, useState, useCallback, useContext, useEffect} from 'react'
import {
  updateAPI,
  updateStatusAPI,
  getByIDAPI,
} from 'src/writeData/subscriptions/context/api'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {sanitizeUpdateForm} from 'src/writeData/subscriptions/utils/form'
import {event} from 'src/cloud/utils/reporting'

// Types
import {RemoteDataState} from 'src/types'
import {Subscription} from 'src/types/subscriptions'
import {
  subscriptionUpdateFail,
  subscriptionStatusUpdateFail,
} from 'src/shared/copy/notifications'

// Contexts

import {SubscriptionListContext} from 'src/writeData/subscriptions/context/subscription.list'

export interface SubscriptionUpdateContextType {
  update: () => void
  currentSubscription: Subscription | null
  saveForm: (subscription) => void
  updateForm: (subscription) => void
  loading: RemoteDataState
  setStatus: (isActive) => void
}

export const DEFAULT_CONTEXT: SubscriptionUpdateContextType = {
  update: () => {},
  saveForm: () => {},
  currentSubscription: {
    name: '',
    description: '',
    protocol: 'mqtt',
    brokerHost: '',
    brokerPort: 0,
    brokerUsername: '',
    brokerPassword: '',
    brokerCert: '',
    brokerKey: '',
    topic: '',
    dataFormat: 'lineprotocol',
    jsonMeasurementKey: {
      path: '',
    },
    jsonFieldKeys: [
      {
        name: '',
        path: '',
      },
    ],
    jsonTagKeys: [
      {
        name: '',
        path: '',
      },
    ],
    jsonTimestamp: {
      name: 'timestamp',
      path: '',
      type: 'string',
    },
    stringMeasurement: {
      pattern: '',
      name: 'measurement',
    },
    stringFields: [
      {
        pattern: '',
        name: '',
      },
    ],
    stringTags: [
      {
        pattern: '',
        name: '',
      },
    ],
    stringTimestamp: {
      pattern: '',
      name: '',
    },
    bucket: 'nifi',
    timestampPrecision: 'NS',
  },
  updateForm: () => {},
  loading: RemoteDataState.NotStarted,
  setStatus: () => {},
} as SubscriptionUpdateContextType

export const SubscriptionUpdateContext = React.createContext<
  SubscriptionUpdateContextType
>(DEFAULT_CONTEXT)

export const SubscriptionUpdateProvider: FC = ({children}) => {
  const {subscriptions, currentID} = useContext(SubscriptionListContext)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription>(
    DEFAULT_CONTEXT.currentSubscription
  )
  useEffect(() => {
    setLoading(RemoteDataState.Loading)
    if (currentID && subscriptions) {
      const current = subscriptions.find(s => s.id === currentID)
      setCurrentSubscription(current)
      setLoading(RemoteDataState.Done)
    }
  }, [currentID])

  const [loading, setLoading] = useState(RemoteDataState.Done)
  const history = useHistory()
  const org = useSelector(getOrg)
  const dispatch = useDispatch()

  const update = (subscription?: Subscription): any => {
    setLoading(RemoteDataState.Loading)
    const params = {id: currentID, data: subscription}
    updateAPI(params)
      .then(() => {
        setLoading(RemoteDataState.Done)
        history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
      })
      .catch(err => {
        setLoading(RemoteDataState.Done)
        dispatch(notify(subscriptionUpdateFail(err.message)))
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
    sanitizeUpdateForm(currentSubscription)
    update(currentSubscription)
  }

  const setStatus = (isActive: boolean): any => {
    setLoading(RemoteDataState.Loading)
    const params = {id: currentID, data: {isActive}}
    updateStatusAPI(params)
      .then(() => {
        getSubscription()
        event('subscription update success', {}, {feature: 'subscriptions'})
      })
      .catch(err => {
        setLoading(RemoteDataState.Done)
        dispatch(notify(subscriptionStatusUpdateFail(err.message)))
        event(
          'subscription update failure',
          {err: err.message},
          {feature: 'subscriptions'}
        )
      })
      .finally(() => {
        event('subscription update attempt', {}, {feature: 'subscriptions'})
      })
  }

  const getSubscription = async (): Promise<void> => {
    const sub = await getByIDAPI({id: currentID})
    if (sub) {
      setCurrentSubscription(sub)
      setLoading(RemoteDataState.Done)
    } else {
      history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
      setLoading(RemoteDataState.Done)
    }
  }
  return (
    <SubscriptionUpdateContext.Provider
      value={{
        update,
        currentSubscription,
        updateForm,
        saveForm,
        loading,
        setStatus,
      }}
    >
      {children}
    </SubscriptionUpdateContext.Provider>
  )
}

export default SubscriptionUpdateProvider
