// Libraries
import React, {FC, useCallback, useState} from 'react'
import {useSelector} from 'react-redux'

// Utils
import {postWrite} from 'src/client'
import {getErrorMessage} from 'src/utils/api'

// Selectors
import {getOrg} from 'src/organizations/selectors'

// Types
import {RemoteDataState, LineProtocolTab, WritePrecision} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface LineProtocolContextType {
  body: string
  handleResetLineProtocol: () => void
  handleSetBody: (_: string) => void
  handleSetTab: (tab: LineProtocolTab) => void
  precision: WritePrecision
  setPrecision: (_: WritePrecision) => void
  tab: LineProtocolTab
  writeError: string
  writeLineProtocol: (_: string) => void
  writeStatus: RemoteDataState
}

export const DEFAULT_CONTEXT: LineProtocolContextType = {
  body: '',
  handleResetLineProtocol: () => {},
  handleSetBody: (_: string) => {},
  handleSetTab: (_: LineProtocolTab) => {},
  precision: WritePrecision.Ns,
  setPrecision: (_: WritePrecision) => {},
  tab: 'Upload File',
  writeError: '',
  writeLineProtocol: (_: string) => {},
  writeStatus: RemoteDataState.NotStarted,
}

export const LineProtocolContext = React.createContext<LineProtocolContextType>(
  DEFAULT_CONTEXT
)

export const LineProtocolProvider: FC<Props> = React.memo(({children}) => {
  const [body, setBody] = useState('')
  const [tab, setTab] = useState<LineProtocolTab>('Upload File')
  const [precision, setPrecision] = useState(WritePrecision.Ns)
  const [writeStatus, setWriteStatus] = useState(RemoteDataState.NotStarted)
  const [writeError, setWriteError] = useState('')

  const org = useSelector(getOrg).name

  const handleResetLineProtocol = () => {
    setBody('')
    setWriteStatus(RemoteDataState.NotStarted)
    setWriteError('')
  }

  const writeLineProtocol = useCallback(
    async (bucket: string) => {
      try {
        setWriteStatus(RemoteDataState.Loading)
        const resp = await postWrite({
          data: body,
          query: {org, bucket, precision},
        })

        if (resp.status === 204) {
          setWriteStatus(RemoteDataState.Done)
        } else if (resp.status === 429) {
          setWriteStatus(RemoteDataState.Error)
          setWriteError('Failed due to plan limits: read cardinality reached')
        } else if (resp.status === 403) {
          const error = getErrorMessage(resp)
          setWriteStatus(RemoteDataState.Error)
          setWriteError(error)
        } else {
          const message = getErrorMessage(resp) || 'Failed to write data'
          if (resp?.data?.code === 'invalid') {
            setWriteStatus(RemoteDataState.Error)
            setWriteError(
              'Failed to write data - invalid line protocol submitted'
            )
          } else {
            setWriteStatus(RemoteDataState.Error)
            setWriteError(message)
          }
          throw new Error(message)
        }
      } catch (error) {
        console.error(error)
      }
    },
    [body, org, precision]
  )

  const handleSetTab = useCallback(
    (tab: LineProtocolTab) => {
      setBody('')
      setTab(tab)
    },
    [setTab, setBody]
  )

  const handleSetBody = useCallback(
    (b: string) => {
      setBody(b)
    },
    [setBody]
  )

  return (
    <LineProtocolContext.Provider
      value={{
        body,
        handleSetBody,
        handleResetLineProtocol,
        handleSetTab,
        precision,
        setPrecision,
        tab,
        writeError,
        writeLineProtocol,
        writeStatus,
      }}
    >
      {children}
    </LineProtocolContext.Provider>
  )
})

export default LineProtocolProvider
