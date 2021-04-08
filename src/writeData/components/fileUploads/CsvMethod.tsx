// Libraries
import React, {FC, useContext} from 'react'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
} from '@influxdata/clockface'

// Components
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploader'
import {getCsvBody} from 'src/buckets/components/csvUploader/CsvUploaderWizard'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

// Types
import {RemoteDataState} from 'src/types'

const CsvMethod: FC = () => {
  const {uploadState, resetUploadState} = useContext(CsvUploaderContext)
  const {bucket} = useContext(WriteDataDetailsContext)

  let buttonText = 'Close'

  if (uploadState === RemoteDataState.Loading) {
    buttonText = 'Cancel'
  }

  if (
    uploadState === RemoteDataState.Error ||
    uploadState === RemoteDataState.Done
  ) {
    buttonText = 'Clear'
  }

  return (
    <>
      {getCsvBody(uploadState, bucket.name)}
      {uploadState !== RemoteDataState.NotStarted && (
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
      )}
    </>
  )
}

export default CsvMethod
