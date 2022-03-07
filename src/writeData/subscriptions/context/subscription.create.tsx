import React, {FC, useState, useCallback} from 'react'
// import {createAPI} from 'src/writeData/subscriptions/context/api'
// import {useDispatch} from 'react-redux'

import {Subscription} from 'src/types/subscriptions'

export interface SubscriptionCreateContextType {
  create: () => void
  formContent: Subscription
  formComplete: boolean
  setFormComplete: (boolean) => void
  updateForm: (formContent) => void
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
    dataFormat: '',
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
    status: '',
    token: '',
    tokenID: '',
    bucket: '',
    qos: 0,
  },
  setFormComplete: () => {},
  updateForm: () => {},
} as SubscriptionCreateContextType

export const SubscriptionCreateContext = React.createContext<
  SubscriptionCreateContextType
>(DEFAULT_CONTEXT)

export const SubscriptionCreateProvider: FC = ({children}) => {
  const [formContent, setFormContent] = useState(DEFAULT_CONTEXT.formContent)
  const [formComplete, setFormComplete] = useState(null)
  // const dispatch = useDispatch()

  const create = (): any => {
    // const create = (formContent?: Subscription): any => {
    // createAPI({data: formContent})
    //   .then(() => {
    //     console.log("success")
    //   })
    //   .catch(() => {
    //     console.log("failure")
    //   })
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

  // useEffect(() => {
  //   create()
  // }, [formComplete])

  return (
    <SubscriptionCreateContext.Provider
      value={{
        create,
        formContent,
        formComplete,
        updateForm,
        setFormComplete,
      }}
    >
      {children}
    </SubscriptionCreateContext.Provider>
  )
}

export default SubscriptionCreateProvider
