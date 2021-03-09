import {
  getAnnotations,
  writeAnnotation,
  getAnnotationStreamsDetails,
} from 'src/annotations/api'
import {Dispatch} from 'react'

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
