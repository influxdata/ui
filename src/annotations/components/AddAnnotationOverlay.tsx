// Libraries
import React, {FC, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import {AnnotationForm} from 'src/annotations/components/annotationForm/AnnotationForm'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Selectors
import {getOverlayParams} from 'src/overlays/selectors'

// Thunks
import {fetchAndSetAnnotationStreams} from 'src/annotations/actions/thunks'

export const AddAnnotationOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const dispatch = useDispatch()
  const {createAnnotation, startTime} = useSelector(getOverlayParams)

  const handleSubmit = (modifiedAnnotation): void => {
    const formIsValid = true
    if (formIsValid) {
      createAnnotation(modifiedAnnotation)
      dispatch(fetchAndSetAnnotationStreams)
      onClose()
    }
  }

  return (
    <AnnotationForm
      title="Add"
      type="point"
      onClose={onClose}
      onSubmit={handleSubmit}
      startTime={startTime}
    />
  )
}
