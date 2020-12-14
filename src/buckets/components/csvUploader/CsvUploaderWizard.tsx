// Libraries
import React, {useContext} from 'react'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  Form,
  Overlay,
  OverlayFooter,
} from '@influxdata/clockface'

// Context
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploaderProvider'

// Components
import CsvUploaderBody from 'src/buckets/components/csvUploader/CsvUploaderBody'
import CsvUploaderSuccess from 'src/buckets/components/csvUploader/CsvUploaderSuccess'

const CsvUploaderWizard = () => {
  const {handleDismiss, uploadFinished} = useContext(CsvUploaderContext)

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={800}>
        <Overlay.Header
          title="Add Data Using CSV Drag and Drop"
          onDismiss={handleDismiss}
        />
        <Form>
          <Overlay.Body style={{textAlign: 'center'}}>
            {uploadFinished ? <CsvUploaderSuccess /> : <CsvUploaderBody />}
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
