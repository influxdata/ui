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

// Context
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploaderProvider'

// Components
import CsvUploaderBody from 'src/buckets/components/csvUploader/CsvUploaderBody'
import CsvUploaderSuccess from 'src/buckets/components/csvUploader/CsvUploaderSuccess'

// Types
import {RemoteDataState} from 'src/types'

const CsvUploaderWizard = () => {
  const {uploadState} = useContext(CsvUploaderContext)
  const history = useHistory()

  const org = useSelector(getOrg)
  const handleDismiss = useCallback(() => {
    history.push(`/orgs/${org.id}/load-data/buckets`)
  }, [history, org.id])

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={800}>
        <Overlay.Header
          title="Add Data Using CSV Drag and Drop"
          onDismiss={handleDismiss}
        />
        <Form>
          <Overlay.Body style={{textAlign: 'center'}}>
            {uploadState === RemoteDataState.Done ? (
              <CsvUploaderSuccess />
            ) : (
              <CsvUploaderBody />
            )}
          </Overlay.Body>
        </Form>
        <OverlayFooter>
          <Button
            color={ComponentColor.Default}
            text="Close"
            size={ComponentSize.Medium}
            type={ButtonType.Button}
            onClick={handleDismiss}
            testID="lp-close--button"
          />
        </OverlayFooter>
      </Overlay.Container>
    </Overlay>
  )
}

export default CsvUploaderWizard
