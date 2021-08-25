// Libraries
import React, {FC} from 'react'
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
 * widget/panel for showing the explicit bucket schema;
 * it does not allow editing but it does allow the user to copy it easily into the clipboard using the
 * CodeSnippet component.
 * */
export const SchemaDisplay: FC<Props> = (props: Props) => {
  const handleClose = () => {
    props.onClose()
  }

  const {schema} = props
  const rawSchema = JSON.stringify(schema, null, 2)

  const makeRawDataView = () => <CodeSnippet text={rawSchema} />

  return (
    <Overlay.Container maxWidth={600}>
      <Overlay.Header
        title={`Explicit Schema for: ${props.bucketName}`}
        onDismiss={handleClose}
      />
      <Overlay.Body>{makeRawDataView()}</Overlay.Body>
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
