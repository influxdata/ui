// Libraries
import React, {FC, useCallback, useContext, useRef, useState} from 'react'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  Panel,
} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import CsvUploaderBody from 'src/buckets/components/csvUploader/CsvUploaderBody'
import StatusIndicator from 'src/buckets/components/csvUploader/StatusIndicator'
import {PROJECT_NAME} from 'src/flows'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {getErrorMessage} from 'src/utils/api'
import {getOrg} from 'src/organizations/selectors'
import {handleRunQuery} from 'src/writeData/apis'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// Selectors
import {
  csvUploadCancelled,
  csvUploaderErrorNotification,
} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

// Types
import {RemoteDataState} from 'src/types'

const CsvMethod: FC = () => {
  const [uploadState, setUploadState] = useState(RemoteDataState.NotStarted)
  const [uploadError, setUploadError] = useState('')

  const {bucket} = useContext(WriteDataDetailsContext)
  const orgId = useSelector(getOrg)?.id
  const history = useHistory()
  const org = useSelector(getOrg)

  const dispatch = useDispatch()

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
    (csv: string, bucket: string) => {
      setUploadState(RemoteDataState.Loading)
      controller.current = new AbortController()
      try {
        const query = `import "csv"
          csv.from(csv: ${JSON.stringify(csv)})
          |> to(bucket: "${bucket}")`

        handleRunQuery(
          org?.id,
          query,
          undefined,
          controller.current,
          setUploadState,
          setUploadError
        )
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

  let body = <CsvUploaderBody bucket={bucket.name} uploadCsv={uploadCsv} />

  if (uploadState !== RemoteDataState.NotStarted) {
    body = (
      <StatusIndicator uploadError={uploadError} uploadState={uploadState} />
    )
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
