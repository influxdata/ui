import React, {FC, useState, useCallback, useEffect} from 'react'
import {createAPI} from 'src/writeData/subscriptions/context/api'

import {Subscription} from 'src/types/subscriptions'
import {sanitizeForm} from '../utils/form'

// Types
import {RemoteDataState} from 'src/types'

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
    // description: '',
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
      type: '',
    },
    jsonFieldKeys: [
      {
        name: '',
        path: '',
        type: '',
      },
    ],
    jsonTagKeys: [
      {
        name: '',
        path: '',
        type: '',
      },
    ],
    jsonTimestamp: {
      name: '',
      path: '',
      type: '',
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
  const create = (formContent?: Subscription): any => {
    setLoading(RemoteDataState.Loading)
    createAPI({data: formContent})
      .then(() => {
        setLoading(RemoteDataState.Done)
        console.log('success')
      })
      .catch(() => {
        setLoading(RemoteDataState.Error)
        console.log('failure')
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
