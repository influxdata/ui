// Libraries
import React, {FC} from 'react'

// Components
import AnnotationForm from 'src/annotations/components/annotationForm/AnnotationForm'

// Type
import {Annotation} from 'src/annotations/reducers/annotationReducer'

const MOCK_ANNOTATION: Annotation = {
  summary: 'I am an annotation',
  message: 'Look at me go',
  type: 'point',
  timeStart: 'timeStart',
  timeStop: 'timeStop',
  streamID: 'anno2',
  bucketName: 'defBuck',
  measurement: 'annotations',
  tags: {
    _field: 'snacks',
  },
}

const EditAnnotationOverlay: FC = () => {
  const handleSubmit = (annotation: Annotation): void => {
    console.log(annotation)
  }

  // NOTE: This value should come from the annotation being edited
  // Could use query params like the add overlay
  // or a different approach
  const annotation = MOCK_ANNOTATION

  return <AnnotationForm title="Edit" onSubmit={handleSubmit} {...annotation} />
}

export default EditAnnotationOverlay
