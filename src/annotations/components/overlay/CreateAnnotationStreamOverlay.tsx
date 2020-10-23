// Libraries
import React, {FC, useContext} from 'react'

// Components
import AnnotationStreamOverlay from 'src/annotations/components/overlay/AnnotationStreamOverlay'
import {Overlay, Button, ComponentColor} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

const CreateAnnotationStreamOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <AnnotationStreamOverlay title="Add Annotation Stream">
      <Overlay.Body>
        <p>Create stuff goes here</p>
      </Overlay.Body>
      <Overlay.Footer>
        <Button text="Cancel" onClick={onClose} />
        <Button
          text="Add Annotation Stream"
          color={ComponentColor.Primary}
          onClick={() => {}}
        />
      </Overlay.Footer>
    </AnnotationStreamOverlay>
  )
}

export default CreateAnnotationStreamOverlay
