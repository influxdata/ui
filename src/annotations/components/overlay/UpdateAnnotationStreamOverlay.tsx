// Libraries
import React, {FC, useContext} from 'react'

// Components
import {AnnotationStreamOverlay} from 'src/annotations/components/overlay/AnnotationStreamOverlay'
import {Overlay, Button, ComponentColor} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

export const UpdateAnnotationStreamOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <AnnotationStreamOverlay title="Edit Annotation Stream">
      <Overlay.Body>
        <p>Update stuff goes here</p>
      </Overlay.Body>
      <Overlay.Footer>
        <Button text="Cancel" onClick={onClose} />
        <Button
          text="Save Changes"
          color={ComponentColor.Success}
          onClick={() => {}}
        />
      </Overlay.Footer>
    </AnnotationStreamOverlay>
  )
}
