// Libraries
import React, {FC, useContext} from 'react'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  Panel,
} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploader'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import CsvUploaderBody from 'src/buckets/components/csvUploader/CsvUploaderBody'
import StatusIndicator from 'src/buckets/components/csvUploader/StatusIndicator'
import {PROJECT_NAME} from 'src/flows'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {RemoteDataState} from 'src/types'

const CsvMethod: FC = () => {
  const {uploadState, resetUploadState} = useContext(CsvUploaderContext)
  const {bucket} = useContext(WriteDataDetailsContext)
  const orgId = useSelector(getOrg)?.id
  const history = useHistory()

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

  let body = <CsvUploaderBody bucket={bucket.name} />

  if (uploadState !== RemoteDataState.NotStarted) {
    body = <StatusIndicator />
  }

  const handleSeeUploadedData = () => {
    if (isFlagEnabled('exploreWithFlows')) {
      history.push(
        `/${PROJECT_NAME.toLowerCase()}/from/bucket/${bucket.name}/${bucket.id}`
      )
    } else {
      history.push(`/orgs/${orgId}/data-explorer?bucket=${bucket.name}`)
    }
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
