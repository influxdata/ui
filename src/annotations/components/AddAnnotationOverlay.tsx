// Libraries
import React, {FC} from 'react'
import {useLocation} from 'react-router-dom'
import qs from 'qs'

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
    // Slicing off the ? from the beginning of search
    const parsedSearch = qs.parse(location.search.slice(1))
    timeStart = parsedSearch['timeStart']
    timeStop = parsedSearch['timeStop']
    type =
      !!timeStart && !!timeStop && timeStart === timeStop ? 'point' : 'range'
  }

  const handleSubmit = (annotation: Annotation): void => {
    // Use the values of annotation to construct a line protocol string and
    // then execute it
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
