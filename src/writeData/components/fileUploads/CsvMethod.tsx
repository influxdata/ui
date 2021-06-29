// Libraries
import React, {FC, useContext} from 'react'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  Panel,
} from '@influxdata/clockface'

// Components
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploader'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import CsvUploaderBody from 'src/buckets/components/csvUploader/CsvUploaderBody'
import CsvUploaderSuccess from 'src/buckets/components/csvUploader/CsvUploaderSuccess'
import CsvUploaderError from 'src/buckets/components/csvUploader/CsvUploaderError'

// Types
import {RemoteDataState} from 'src/types'

const getCsvBody = (uploadState: RemoteDataState, bucket?: string) => {
  switch (uploadState) {
    case RemoteDataState.Done:
      return <CsvUploaderSuccess />
    case RemoteDataState.Error:
      return <CsvUploaderError />
    default:
      return <CsvUploaderBody bucket={bucket} />
  }
}

const CsvMethod: FC = () => {
  const {uploadState, resetUploadState} = useContext(CsvUploaderContext)
  const {bucket} = useContext(WriteDataDetailsContext)

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

  return (
    <Panel>
      <Panel.Body className="csv-body--padding">
        {getCsvBody(uploadState, bucket.name)}
      </Panel.Body>
      {uploadState !== RemoteDataState.NotStarted && (
        <Panel.Footer>
          <div className="csv-button--wrapper">
            <Button
              color={ComponentColor.Default}
              text={buttonText}
              size={ComponentSize.Medium}
              type={ButtonType.Button}
              onClick={resetUploadState}
              testID="csv-state--button"
              style={{minWidth: 100}}
            />
          </div>
        </Panel.Footer>
      )}
    </Panel>
  )
}

export default CsvMethod
