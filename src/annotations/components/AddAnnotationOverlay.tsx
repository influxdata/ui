// Libraries
import React, {FC} from 'react'
import {useParams} from 'react-router-dom'

// Components
import AnnotationForm from 'src/annotations/components/annotationForm/AnnotationForm'

// Type
import {Annotation} from 'src/annotations/reducers/annotationReducer'

const AddAnnotationOverlay: FC = () => {
  const params = useParams()
  const handleSubmit = (annotation: Annotation): void => {
    console.log(annotation)
  }

  // NOTE: This value should come from the annotation being edited
  // Could use query params like the add overlay
  // or a different approach
  console.log(params)

  return (
    <AnnotationForm
      title="Add"
      onSubmit={handleSubmit}
      timeStart="sdfdsf"
      timeStop="sdfsf"
      type="point"
    />
  )
}

export default AddAnnotationOverlay
