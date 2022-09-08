// Libraries
import React, {FC, useCallback, useState, useRef} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Utils
import {runQuery} from 'src/shared/apis/query'
import {event} from 'src/cloud/utils/reporting'
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'
import {getErrorMessage} from 'src/utils/api'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {
  csvUploadCancelled,
  csvUploaderErrorNotification,
} from 'src/shared/copy/notifications'

// Types
import {RemoteDataState} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface CsvUploaderContextType {
  resetUploadState: () => void
  uploadCsv: (csv: string, bucket: string) => void
  uploadError: string
  uploadState: RemoteDataState
}

export const DEFAULT_CONTEXT: CsvUploaderContextType = {
  resetUploadState: () => {},
  uploadCsv: (_: string, __: string) => {},
  uploadError: '',
  uploadState: RemoteDataState.NotStarted,
}

export const CsvUploaderContext =
  React.createContext<CsvUploaderContextType>(DEFAULT_CONTEXT)

export const CsvUploaderProvider: FC<Props> = React.memo(({children}) => {
  const [uploadState, setUploadState] = useState(RemoteDataState.NotStarted)
  const [uploadError, setUploadError] = useState('')

  const dispatch = useDispatch()

  const org = useSelector(getOrg)

  const controller = useRef<AbortController>(null)

  const resetUploadState = (): void => {
    setUploadState(RemoteDataState.NotStarted)
    controller.current.abort()
  }

  const handleError = useCallback(
    (error: Error): void => {
      const message = getErrorMessage(error)
      if (
        error?.name === 'AbortError' ||
        message?.includes('aborted') ||
        error?.name === 'CancellationError'
      ) {
        event('Aborting_CSV_Upload')
        setUploadState(RemoteDataState.NotStarted)
        dispatch(notify(csvUploadCancelled()))
        return
      }
      setUploadState(RemoteDataState.Error)
      if (
        message.includes('incorrectly formatted') ||
        message.includes('The CSV could not be parsed')
      ) {
        event('CSV_Upload_Format_Error')
      } else {
        reportErrorThroughHoneyBadger(error, {
          name: 'uploadCsv function',
        })
      }
      setUploadError(message)
      dispatch(notify(csvUploaderErrorNotification(message)))
    },
    [dispatch]
  )

  const uploadCsv = useCallback(
    async (csv: string, bucket: string) => {
      setUploadState(RemoteDataState.Loading)
      controller.current = new AbortController()
      try {
        const query = `import "csv"
          csv.from(csv: ${JSON.stringify(csv)})
          |> to(bucket: "${bucket}")`

        const resp = await runQuery(
          org?.id,
          query,
          undefined,
          controller.current
        ).promise

        if (resp.type === 'SUCCESS') {
          setUploadState(RemoteDataState.Done)
          return
        }
        if (resp.type === 'RATE_LIMIT_ERROR') {
          setUploadState(RemoteDataState.Error)
          setUploadError('Failed due to plan limits: read cardinality reached')
          return
        }
        if (resp.type === 'UNKNOWN_ERROR') {
          const error = getErrorMessage(resp)
          throw new Error(error)
        }
      } catch (error) {
        handleError(error)
      }
    },
    [handleError, org?.id]
  )

  return (
    <CsvUploaderContext.Provider
      value={{
        resetUploadState,
        uploadCsv,
        uploadError,
        uploadState,
      }}
    >
      {children}
    </CsvUploaderContext.Provider>
  )
})

export default CsvUploaderProvider
