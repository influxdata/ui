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
  const {
    createAnnotation,
    startTime,
    endTime,
    range,
    eventPrefix,
  } = useSelector(getOverlayParams)

  // const dashboardID = useSelector((state: AppState) =>
  // state.currentDashboard.id
  // )

  // todo: need the to get the proper time; hopefully the time format is the same dashboard wide :crossed_fingers:
  // const timeFormat = useSelector((state: AppState) =>
  // getTimeFormatForView(state, state.currentDashboard.id)
  // )

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
      // timeFormat={timeFormat}
      // stream={dashboardID}
    />
  )
}
