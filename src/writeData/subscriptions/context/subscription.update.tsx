// Libraries
import React, {FC, useState, useCallback, useContext, useEffect} from 'react'
import {updateAPI} from 'src/writeData/subscriptions/context/api'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {sanitizeUpdateForm} from '../utils/form'

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
      name: '',
      path: '',
      type: 'string',
    },
    jsonFieldKeys: [
      {
        name: '',
        path: '',
        type: 'string',
      },
    ],
    jsonTagKeys: [
      {
        name: '',
        path: '',
        type: 'string',
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
    qos: 0,
  },
  updateForm: () => {},
  loading: RemoteDataState.NotStarted,
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
    sanitizeUpdateForm(currentSubscription)
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
