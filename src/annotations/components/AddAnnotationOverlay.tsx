// Libraries
import React, {FC} from 'react'
import {useLocation} from 'react-router-dom'

// Components
import AnnotationForm from 'src/annotations/components/annotationForm/AnnotationForm'
import AnnotationErrorOverlay from 'src/annotations/components/AnnotationErrorOverlay'

// Type
import {Annotation} from 'src/annotations/reducers/annotationReducer'

const AddAnnotationOverlay: FC = () => {
  // NOTE: using query search strings to pass some information from
  // the visualization components up to this overlay
  // without having to stick anything in state
  const location = useLocation()

  let timeStart
  let timeStop
  let type

  if (location && location.search) {
    // There has to be a better way to do this
    const searchTimeStart = location.search.match(/timeStart=([^&]*)/g)
    const searchTimeStop = location.search.match(/timeStop=([^&]*)/g)
    timeStart = searchTimeStart
      ? `${searchTimeStart}`.replace('timeStart=', '')
      : undefined
    timeStop = searchTimeStop
      ? `${searchTimeStop}`.replace('timeStop=', '')
      : undefined
    type =
      !!timeStart && !!timeStop && timeStart === timeStop ? 'point' : 'range'
  }

  const handleSubmit = (annotation: Annotation): void => {
    console.log(annotation)
  }

  if (!timeStart || !timeStop) {
    return <AnnotationErrorOverlay />
  }

  return (
    <AnnotationForm
      title="Add"
      onSubmit={handleSubmit}
      timeStart={timeStart}
      timeStop={timeStop}
      type={type}
    />
  )
}

export default AddAnnotationOverlay
