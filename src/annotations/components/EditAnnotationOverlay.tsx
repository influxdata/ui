// Libraries
import React, {FC, useContext, FormEvent} from 'react'
import {useSelector} from 'react-redux'

// Components
import {EditAnnotationForm} from 'src/annotations/components/EditAnnotationForm'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Selectors
import {getOverlayParams} from 'src/overlays/selectors'

// Types
import {Annotation} from 'src/types'

export const EditAnnotationOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const {clickedAnnotation, editAnnotation} = useSelector(getOverlayParams)

  const handleSubmit = (
    e: FormEvent,
    editedAnnotation: Partial<Annotation>
  ): void => {
    e.preventDefault()
    const formIsValid = true
    if (formIsValid) {
      editAnnotation(editedAnnotation)
      onClose()
    }
  }

  return (
    <EditAnnotationForm
      handleSubmit={handleSubmit}
      annotation={clickedAnnotation}
      handleClose={onClose}
    />
  )
}
