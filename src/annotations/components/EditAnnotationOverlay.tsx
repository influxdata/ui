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
import {EditAnnotation} from 'src/types'

// Notifications
import {
  editAnnotationSuccess,
  editAnnotationFailed,
} from 'src/shared/copy/notifications'

import {notify} from 'src/shared/actions/notifications'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {getErrorMessage} from 'src/utils/api'
import {AnnotationForm} from './annotationForm/AnnotationForm'

export const EditAnnotationOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const dispatch = useDispatch()
  const {clickedAnnotation} = useSelector(getOverlayParams)

  const handleSubmit = async (
    editedAnnotation: EditAnnotation
  ): Promise<void> => {
    try {
      await dispatch(editAnnotation(editedAnnotation))
      event('annotations.edit_annotation.success')
      dispatch(notify(editAnnotationSuccess()))
      onClose()
    } catch (err) {
      event('annotations.edit_annotation.failure')
      dispatch(notify(editAnnotationFailed(getErrorMessage(err))))
    }
  }

  const annoType =
    clickedAnnotation.startTime === clickedAnnotation.endTime
      ? 'point'
      : 'range'

  console.log('about to edit this annotation...', clickedAnnotation)

  return (
    <AnnotationForm
      onSubmit={handleSubmit}
      startTime={clickedAnnotation.startTime}
      id={clickedAnnotation.id}
      endTime={clickedAnnotation.endTime}
      type={annoType}
      summary={clickedAnnotation.summary}
      stream={clickedAnnotation.stream}
      onClose={onClose}
      title="Edit"
    />
  )
}
