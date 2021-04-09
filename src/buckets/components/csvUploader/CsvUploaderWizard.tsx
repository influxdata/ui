// Libraries
import React, {useContext, useCallback} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  Form,
  Overlay,
  OverlayFooter,
} from '@influxdata/clockface'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

// Context
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploader'

// Components
import CsvUploaderBody from 'src/buckets/components/csvUploader/CsvUploaderBody'
import CsvUploaderSuccess from 'src/buckets/components/csvUploader/CsvUploaderSuccess'
import CsvUploaderError from 'src/buckets/components/csvUploader/CsvUploaderError'
import CsvUploaderHelperText from 'src/buckets/components/csvUploader/CsvUploaderHelperText'

// Types
import {RemoteDataState} from 'src/types'

export const getCsvBody = (uploadState: RemoteDataState, bucket?: string) => {
  switch (uploadState) {
    case RemoteDataState.Done:
      return <CsvUploaderSuccess />
    case RemoteDataState.Error:
      return <CsvUploaderError />
    default:
      return <CsvUploaderBody bucket={bucket} />
  }
}

const CsvUploaderWizard = () => {
  const {resetUploadState, uploadState} = useContext(CsvUploaderContext)
  const history = useHistory()

  const org = useSelector(getOrg)
  const handleDismiss = useCallback(() => {
    if (uploadState === RemoteDataState.Loading) {
      event('CSV_Upload_Cancelled')
    }
    history.push(`/orgs/${org.id}/load-data/buckets`)
    resetUploadState()
  }, [history, org.id, resetUploadState])

  let buttonText = 'Close'

  if (uploadState === RemoteDataState.Loading) {
    buttonText = 'Cancel'
  }

  if (uploadState === RemoteDataState.Error) {
    buttonText = 'Clear'
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={800}>
        <Overlay.Header
          title="Add Data Using CSV Drag and Drop"
          onDismiss={handleDismiss}
        />
        <Form>
          <Overlay.Body style={{textAlign: 'center'}}>
            {getCsvBody(uploadState)}
            <CsvUploaderHelperText />
          </Overlay.Body>
        </Form>
        <OverlayFooter>
          <Button
            color={ComponentColor.Default}
            text={buttonText}
            size={ComponentSize.Medium}
            type={ButtonType.Button}
            onClick={
              uploadState === RemoteDataState.Error
                ? resetUploadState
                : handleDismiss
            }
            testID="csv-close--button"
          />
        </OverlayFooter>
      </Overlay.Container>
    </Overlay>
  )
}

export default CsvUploaderWizard
