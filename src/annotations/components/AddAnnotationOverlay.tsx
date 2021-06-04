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
  const {createAnnotation, startTime, endTime, range} = useSelector(
    getOverlayParams
  )

  const handleSubmit = (modifiedAnnotation): void => {
    createAnnotation(modifiedAnnotation)
    onClose()
  }

  const annoType = range ? 'range' : 'point'

  return (
    <AnnotationForm
      title="Add"
      type={annoType}
      onClose={onClose}
      onSubmit={handleSubmit}
      startTime={startTime}
      endTime={endTime}
    />
  )
}
