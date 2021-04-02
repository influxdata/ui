// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Components
import {AnnotationForm} from 'src/annotations/components/annotationForm/AnnotationForm'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Selectors
import {getOverlayParams} from 'src/overlays/selectors'

export const AddAnnotationOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const {createAnnotation, startTime} = useSelector(getOverlayParams)

  const handleSubmit = (modifiedAnnotation): void => {
    const formIsValid = true
    if (formIsValid) {
      createAnnotation(modifiedAnnotation)
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
