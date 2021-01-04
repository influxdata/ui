// Libraries
import React, {FC} from 'react'

// Components
import {AnnotationForm} from 'src/annotations/components/annotationForm/AnnotationForm'

// Types
import {Annotation} from 'src/annotations/reducers/annotationFormReducer'

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

export const EditAnnotationOverlay: FC = () => {
  const handleSubmit = (_annotation: Annotation): void => {
    // Use the values of annotation to construct a line protocol string and
    // then execute it
  }

  // NOTE: This value should come from the annotation being edited
  // Could use query strings like the add overlay
  // or a different approach
  const annotation = MOCK_ANNOTATION

  return <AnnotationForm title="Edit" onSubmit={handleSubmit} {...annotation} />
}
