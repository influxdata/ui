// Libraries
import React, {FC, useCallback, useContext, useState, useRef} from 'react'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  Panel,
} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'

// Components
// import {CsvUploaderContext} from 'src/buckets/components/context/csvUploader'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import CsvUploaderBody from 'src/buckets/components/csvUploader/CsvUploaderBody'
import StatusIndicator from 'src/buckets/components/csvUploader/StatusIndicator'
import {PROJECT_NAME} from 'src/flows'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {runQuery} from 'src/shared/apis/query'
import {event} from 'src/cloud/utils/reporting'
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'
import {getErrorMessage} from 'src/utils/api'

// Selectors
// import {getOrg} from 'src/organizations/selectors'
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




const CsvMethod: FC = () => {
  // TODO: move state and functions from csv uploader context into here 

  // const CsvUploaderNotContext = () => {
  //   const csvUploaderObject = {};
  
  //   const [uploadState, setUploadState] = useState(RemoteDataState.NotStarted)
  //   const [uploadError, setUploadError] = useState('')
  
  //   const dispatch = useDispatch()
  
  //   const org = useSelector(getOrg)
  
  //   const controller = useRef<AbortController>(null)
  
  //   const resetUploadState = (): void => {
  //     setUploadState(RemoteDataState.NotStarted)
  //     controller.current.abort()
  //   }
  
    
   
  // }

  // const {uploadState, resetUploadState} = useContext(CsvUploaderContext)
  const {bucket} = useContext(WriteDataDetailsContext)
  const orgId = useSelector(getOrg)?.id
  const history = useHistory()

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

  const handleSeeUploadedData = () => {
    if (isFlagEnabled('exploreWithFlows')) {
      history.push(
        `/${PROJECT_NAME.toLowerCase()}/from/bucket/${bucket.name}/${bucket.id}`
      )
    } else {
      history.push(`/orgs/${orgId}/data-explorer?bucket=${bucket.name}`)
    }
  }
  
  let buttonText = 'Close'

  if (uploadState === RemoteDataState.Loading) {
    buttonText = 'Cancel'
  }

  if (uploadState === RemoteDataState.Done) {
    buttonText = 'Upload More Data'
  }
  if (uploadState === RemoteDataState.Error) {
    buttonText = 'Clear Error'
  }

  let body = <CsvUploaderBody bucket={bucket.name} uploadCsv={uploadCsv}/>

  if (uploadState !== RemoteDataState.NotStarted) {
    body = <StatusIndicator uploadError={uploadError} uploadState={uploadState}/>
  }

  


  return (
    <Panel>
      <Panel.Body className="csv-body--padding">{body}</Panel.Body>
      {uploadState !== RemoteDataState.NotStarted && (
        <Panel.Footer>
          <div className="csv-button--wrapper">
            <Button
              color={ComponentColor.Default}
              text={buttonText}
              size={ComponentSize.Medium}
              type={ButtonType.Button}
              onClick={resetUploadState}
              className="csv-upload--button"
              testID="csv-state--button"
            />
            {uploadState === RemoteDataState.Done && (
              <Button
                color={ComponentColor.Default}
                text="See Uploaded Data"
                size={ComponentSize.Medium}
                type={ButtonType.Button}
                onClick={handleSeeUploadedData}
                testID="see-csv-data--button"
                className="csv-upload--button"
              />
            )}
          </div>
        </Panel.Footer>
      )}
    </Panel>
  )
}

export default CsvMethod
