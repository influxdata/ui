// Libraries
import React, {FC} from 'react'
import './SchemaDisplay.css'
import CodeSnippet from 'src/shared/components/CodeSnippet'

import {
  MeasurementSchemaList,
  MeasurementSchema,
} from 'src/client/generatedRoutes'

// Components
import {Button, Overlay} from '@influxdata/clockface'

interface Props {
  onClose: () => void
  bucketName: string
  measurementSchemaList?: MeasurementSchemaList
  schema?: MeasurementSchema
}

/**
 *  Form for editing and creating annotations.
 *  It does support multi-line annotations, but the tradeoff is that the user cannot then press 'return' to submit the form.
 * */
export const SchemaDisplay: FC<Props> = (props: Props) => {
  const handleClose = () => {
    props.onClose()
  }

  const {schema} = props
  const rawSchema = JSON.stringify(schema, null, 2)

  const makeRawDataView = () => <CodeSnippet text={rawSchema} />

  return (
    <Overlay.Container maxWidth="600">
      <Overlay.Header
        title={`Explicit Schema for: ${props.bucketName}`}
        onDismiss={handleClose}
      />
      <Overlay.Body>
        <div>{makeRawDataView()}</div>
      </Overlay.Body>
      <Overlay.Footer>
        <div>
          <Button
            text="Close"
            onClick={handleClose}
            testID="show-explicit-schema-button-close"
          />
        </div>
      </Overlay.Footer>
    </Overlay.Container>
  )
}
