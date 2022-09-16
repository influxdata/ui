// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Components
import {AnnotationForm} from 'src/annotations/components/annotationForm/AnnotationForm'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Selectors
import {getOverlayParams} from 'src/overlays/selectors'
import {getTimeFormatForView} from 'src/views/selectors'
import {AppState} from 'src/types'

export const AddAnnotationOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const {createAnnotation, startTime, endTime, range, eventPrefix, cellID} =
    useSelector(getOverlayParams)

  const timeFormat = useSelector((state: AppState) =>
    getTimeFormatForView(state, cellID)
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
      eventPrefix={eventPrefix}
      timeFormat={timeFormat}
    />
  )
}
