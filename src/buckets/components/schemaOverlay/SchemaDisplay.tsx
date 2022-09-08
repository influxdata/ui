// Libraries
import React, {FC} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Components
import {Button, Overlay} from '@influxdata/clockface'
import {CLOUD} from 'src/shared/constants'

let MeasurementSchemaList = null,
  MeasurementSchema = null

if (CLOUD) {
  MeasurementSchema = require('src/client/generatedRoutes').MeasurementSchema
  MeasurementSchemaList =
    require('src/client/generatedRoutes').MeasurementSchemaList
}

interface Props {
  onClose: () => void
  bucketName: string
  measurementSchemaList?: typeof MeasurementSchemaList
  schema?: typeof MeasurementSchema
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
