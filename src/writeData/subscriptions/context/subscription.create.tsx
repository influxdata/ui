// Libraries
import React, {FC, useState, useCallback, useEffect} from 'react'
import {createAPI} from 'src/writeData/subscriptions/context/api'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Utils
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {getOrg} from 'src/organizations/selectors'
import {sanitizeForm} from '../utils/form'

// Types
import {RemoteDataState} from 'src/types'
import {Subscription} from 'src/types/subscriptions'

export interface SubscriptionCreateContextType {
  create: () => void
  formContent: Subscription
  formComplete: boolean
  setFormComplete: (boolean) => void
  updateForm: (formContent) => void
  loading: RemoteDataState
}

export const DEFAULT_CONTEXT: SubscriptionCreateContextType = {
  create: () => {},
  formComplete: false,
  formContent: {
    name: '',
    description: '',
    protocol: 'MQTT',
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
      name: '',
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
  setFormComplete: () => {},
  updateForm: () => {},
  loading: RemoteDataState.NotStarted,
} as SubscriptionCreateContextType

export const SubscriptionCreateContext = React.createContext<
  SubscriptionCreateContextType
>(DEFAULT_CONTEXT)

export const SubscriptionCreateProvider: FC = ({children}) => {
  const [formContent, setFormContent] = useState(DEFAULT_CONTEXT.formContent)
  const [formComplete, setFormComplete] = useState(false)
  const [loading, setLoading] = useState(RemoteDataState.Done)
  const history = useHistory()
  const org = useSelector(getOrg)
  const create = (formContent?: Subscription): any => {
    setLoading(RemoteDataState.Loading)
    createAPI({data: formContent})
      .then(() => {
        setLoading(RemoteDataState.Done)
        history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
      })
      .catch(() => {
        setLoading(RemoteDataState.Error)
        // add err notification
      })
  }

  const updateForm = useCallback(
    formContent => {
      setFormContent(prev => ({
        ...prev,
        ...formContent,
      }))
    },
    [formContent] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    if (formComplete) {
      sanitizeForm(formContent)
      create(formContent)
    }
  }, [formComplete])

  return (
    <SubscriptionCreateContext.Provider
      value={{
        create,
        formContent,
        formComplete,
        updateForm,
        setFormComplete,
        loading,
      }}
    >
      {children}
    </SubscriptionCreateContext.Provider>
  )
}

export default SubscriptionCreateProvider
