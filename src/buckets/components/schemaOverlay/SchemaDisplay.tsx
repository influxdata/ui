// Libraries
import React, {FC} from 'react'
//import React, {FC, FormEvent, useState} from 'react'
import './SchemaDisplay.css'

import {MeasurementSchemaList, MeasurementSchema} from  'src/client/generatedRoutes'
// Utils
//import {event} from 'src/cloud/utils/reporting'
import classnames from 'classnames'

// Components
import {
  Button,
  Overlay,
} from '@influxdata/clockface'


// Style
import 'src/annotations/components/annotationForm/annotationForm.scss'

interface Props {
  onClose: () => void
  name?: string
    measurementSchemaList?: MeasurementSchemaList
    schema?: MeasurementSchema
}

/**
 *  Form for editing and creating annotations.
 *  It does support multi-line annotations, but the tradeoff is that the user cannot then press 'return' to submit the form.
 * */
export const SchemaDisplay: FC<Props> = (props: Props) => {

  const handleCancel = () => {
    props.onClose()
  }

  //TODO: remove me.....
console.log('arghh!! hope to get here eventually......', props)
const {schema} = props
    const rawSchema = JSON.stringify(schema)


    const makeRawDataView = () => (
        <div className='rawtext'>
          {rawSchema}
        </div>
    )

  return (
    <Overlay.Container maxWidth="600">
      <Overlay.Header
        title="View Explicit Schema"
        onDismiss={handleCancel}
        className="edit-annotation-head"
      />
        <Overlay.Body>
     <div>
         {makeRawDataView()}
     </div>
        </Overlay.Body>
        <Overlay.Footer>
          <div>
            <Button
              text="Close"
              onClick={handleCancel}
              testID="edit-annotation-cancel-button2"
              className="edit-annotation-cancel"
            />
          </div>
        </Overlay.Footer>
    </Overlay.Container>
  )
}
