// Libraries
import React, {FC, useCallback, useState} from 'react'
import {useSelector} from 'react-redux'

// Utils
import {postWrite} from 'src/client'
import {getErrorMessage} from 'src/utils/api'

// Selectors
import {getOrg, isOrgIOx} from 'src/organizations/selectors'

// Types
import {RemoteDataState, LineProtocolTab, WritePrecision} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface LineProtocolContextType {
  body: string
  handleResetLineProtocol: () => void
  handleTryAgainLineProtocol: () => void
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
  handleTryAgainLineProtocol: () => {},
  handleSetBody: (_: string) => {},
  handleSetTab: (_: LineProtocolTab) => {},
  precision: WritePrecision.Ns,
  setPrecision: (_: WritePrecision) => {},
  tab: 'Upload File',
  writeError: '',
  writeLineProtocol: (_: string) => {},
  writeStatus: RemoteDataState.NotStarted,
}

export const LineProtocolContext =
  React.createContext<LineProtocolContextType>(DEFAULT_CONTEXT)

export const LineProtocolProvider: FC<Props> = React.memo(({children}) => {
  const [body, setBody] = useState('')
  const [tab, setTab] = useState<LineProtocolTab>('Upload File')
  const [precision, setPrecision] = useState(WritePrecision.Ns)
  const [writeStatus, setWriteStatus] = useState(RemoteDataState.NotStarted)
  const [writeError, setWriteError] = useState('')

  const org = useSelector(getOrg).name
  const orgIsIOx = useSelector(isOrgIOx)

  const handleResetLineProtocol = () => {
    setBody('')
    setWriteStatus(RemoteDataState.NotStarted)
    setWriteError('')
  }

  const handleTryAgainLineProtocol = () => {
    setWriteStatus(RemoteDataState.NotStarted)
    setWriteError('')
  }

  /**
   *  change in newest api (since the hash was last updated in 9/2021):
   *     * error 429 (too many requests) is in CLOUD and not in OSS
   *     * error 403 was removed, added error 404 (not found)
   */
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
          // here is the cast:
        } else if ((resp.status as any) === 429) {
          setWriteStatus(RemoteDataState.Error)
          if (orgIsIOx) {
            setWriteError(
              'This request exceeded the read or write limits for your plan'
            )
          } else {
            setWriteError(
              'This request exceeded the read, write, or cardinality limits for your plan'
            )
          }
        } else if (resp.status === 404) {
          const error =
            getErrorMessage(resp) || 'Endpoint not Found; Failed to write data'
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
        handleTryAgainLineProtocol,
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
