// Libraries
import React, {FC, useState, useCallback, useEffect} from 'react'
import {createAPI} from 'src/writeData/subscriptions/context/api'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {getOrg} from 'src/organizations/selectors'
import {sanitizeForm} from 'src/writeData/subscriptions/utils/form'
import {notify} from 'src/shared/actions/notifications'
import {event} from 'src/cloud/utils/reporting'

// Types
import {RemoteDataState} from 'src/types'
import {BrokerAuthTypes, Subscription} from 'src/types/subscriptions'
import {subscriptionCreateFail} from 'src/shared/copy/notifications'

export interface SubscriptionCreateContextType {
  create: () => void
  formContent: Subscription
  saveForm: (formContent) => void
  updateForm: (formContent) => void
  loading: RemoteDataState
}

export const DEFAULT_CONTEXT: SubscriptionCreateContextType = {
  create: () => {},
  saveForm: () => {},
  formContent: {
    name: '',
    description: '',
    protocol: 'mqtt',
    brokerHost: '',
    brokerPort: undefined,
    brokerUsername: '',
    brokerPassword: '',
    brokerClientCert: '',
    brokerClientKey: '',
    brokerCACert: '',
    authType: BrokerAuthTypes.None,
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
    jsonTagKeys: [],
    jsonTimestamp: {
      name: 'timestamp',
      path: '',
      type: 'string',
    },
    stringMeasurement: {
      pattern: '',
      name: '',
    },
    stringFields: [
      {
        pattern: '',
        name: '',
      },
    ],
    stringTags: [],
    stringTimestamp: {
      pattern: '',
      name: '',
    },
    bucket: 'nifi',
    timestampPrecision: 'NS',
  },
  updateForm: () => {},
  loading: RemoteDataState.NotStarted,
} as SubscriptionCreateContextType

export const SubscriptionCreateContext =
  React.createContext<SubscriptionCreateContextType>(DEFAULT_CONTEXT)

export const SubscriptionCreateProvider: FC = ({children}) => {
  const [formContent, setFormContent] = useState(DEFAULT_CONTEXT.formContent)
  const [loading, setLoading] = useState(RemoteDataState.Done)
  const history = useHistory()
  const org = useSelector(getOrg)
  const dispatch = useDispatch()
  const create = (formContent?: Subscription): any => {
    setLoading(RemoteDataState.Loading)
    const sanitizedForm = {...formContent} as Subscription
    createAPI({data: sanitizedForm})
      .then(() => {
        setLoading(RemoteDataState.Done)
        history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
        event(
          'subscription creation successful',
          {},
          {feature: 'subscriptions'}
        )
      })
      .catch(err => {
        setLoading(RemoteDataState.Done)
        dispatch(notify(subscriptionCreateFail(err.message)))
        event(
          'subscription creation failure',
          {err: err.message},
          {feature: 'subscriptions'}
        )
      })
      .finally(() => {
        event('subscription creation attempt', {}, {feature: 'subscriptions'})
      })
  }

  useEffect(() => {
    setFormContent(prev => ({
      ...prev,
      brokerUsername: null,
      brokerPassword: null,
    }))
  }, [setFormContent])

  const updateForm = useCallback(
    formContent => {
      setFormContent(prev => ({
        ...prev,
        ...formContent,
      }))
    },
    [formContent] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const saveForm = (formContent?: Subscription): void => {
    sanitizeForm(formContent)
    create(formContent)
  }

  return (
    <SubscriptionCreateContext.Provider
      value={{
        create,
        formContent,
        updateForm,
        saveForm,
        loading,
      }}
    >
      {children}
    </SubscriptionCreateContext.Provider>
  )
}

export default SubscriptionCreateProvider
