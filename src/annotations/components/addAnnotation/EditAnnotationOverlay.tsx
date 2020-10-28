// Libraries
import React, {FC, useContext} from 'react'

// Components
import AnnotationOverlay from 'src/annotations/components/addAnnotation/AnnotationOverlay'
import {Overlay, Button, ComponentColor} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

const EditAnnotationOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <AnnotationOverlay title="Edit Annotation">
      <Overlay.Body>
        <p>Edit form goes here</p>
      </Overlay.Body>
      <Overlay.Footer>
        <Button text="Cancel" onClick={onClose} />
        <Button text="Save Changes" color={ComponentColor.Success} />
      </Overlay.Footer>
    </AnnotationOverlay>
  )
}

export default EditAnnotationOverlay
