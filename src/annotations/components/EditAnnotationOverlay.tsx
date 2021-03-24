// Libraries
import React, {FC, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import {EditAnnotationForm} from 'src/annotations/components/EditAnnotationForm'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Selectors
import {getOverlayParams} from 'src/overlays/selectors'

// Actions
import {editAnnotation} from 'src/annotations/actions/thunks'
// Types
import {EditAnnotationState} from 'src/annotations/components/EditAnnotationForm'

export const EditAnnotationOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const dispatch = useDispatch()
  const {clickedAnnotation} = useSelector(getOverlayParams)

  const handleSubmit = (editedAnnotation: EditAnnotationState): void => {
    dispatch(editAnnotation(editedAnnotation))
    onClose()
  }

  return (
    <EditAnnotationForm
      handleSubmit={handleSubmit}
      annotation={clickedAnnotation}
      handleClose={onClose}
    />
  )
}
