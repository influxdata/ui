import {
  getAnnotations,
  getAnnotationStreamsDetails,
  deleteAnnotation,
  writeAnnotation,
} from 'src/annotations/api'
import {Dispatch} from 'react'
import {deleteAnnotation as deleteAnnotationAction} from 'src/annotations/actions/creators'
import {
  setAnnotations,
  setAnnotationStreams,
  Action as AnnotationAction,
} from 'src/annotations/actions/creators'

import {Annotation, AnnotationStream} from 'src/types'

export const fetchAndSetAnnotationStreams = async (
  dispatch: Dispatch<AnnotationAction>
): Promise<void> => {
  const annotationStreams: AnnotationStream[] = await getAnnotationStreamsDetails()

  dispatch(setAnnotationStreams(annotationStreams))
}

export const fetchAndSetAnnotations = () => async (
  dispatch: Dispatch<AnnotationAction>
): Promise<void> => {
  const annotations = await getAnnotations()

  dispatch(setAnnotations(annotations))
}

export const writeThenFetchAndSetAnnotations = (
  annotations: Annotation[]
) => async (dispatch: Dispatch<AnnotationAction>): Promise<void> => {
  await writeAnnotation(annotations)

  fetchAndSetAnnotations()(dispatch)
}
export const deleteAnnotations = annotation => async (
  dispatch: Dispatch<AnnotationAction>
) => {
  await deleteAnnotation(annotation)
  dispatch(deleteAnnotationAction(annotation))
  fetchAndSetAnnotations()(dispatch)
}
