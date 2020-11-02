// Libraries
import React, {FC} from 'react'
import {RouteProps, useLocation} from 'react-router-dom'

// Components
import AnnotationForm from 'src/annotations/components/annotationForm/AnnotationForm'
import AnnotationErrorOverlay from 'src/annotations/components/AnnotationErrorOverlay'

// Types
import {Annotation} from 'src/annotations/reducers/annotationFormReducer'

const AddAnnotationOverlay: FC = () => {
  const location: RouteProps['location'] = useLocation()
  const params = location.state
  const {timeStart, timeStop} = params[0]
  const type = timeStart === timeStop ? 'point' : 'range'

  const handleSubmit = (_annotation: Annotation): void => {
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
