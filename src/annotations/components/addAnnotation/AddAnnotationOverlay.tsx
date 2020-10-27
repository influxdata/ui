// Libraries
import React, {FC, useContext} from 'react'

// Components
import AnnotationOverlay from 'src/annotations/components/addAnnotation/AnnotationOverlay'
import {Overlay, Button, ComponentColor} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

const AddAnnotationOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <AnnotationOverlay title="Add Annotation">
      <Overlay.Body>
        <p>Add annotation!!1</p>
        {/* TODO: wrap children in GetResources with ResourceType.AnnotationStreams */}
      </Overlay.Body>
      <Overlay.Footer>
        <Button text="Cancel" onClick={onClose} />
        <Button text="Add Annotation" color={ComponentColor.Primary} />
      </Overlay.Footer>
    </AnnotationOverlay>
  )
}

export default AddAnnotationOverlay
