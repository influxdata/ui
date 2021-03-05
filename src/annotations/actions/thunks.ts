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

import {Annotation, AnnotationStreamDetail} from 'src/types'

export const fetchSetAnnotationStreamDetails = async (
  dispatch: Dispatch<AnnotationAction>
): Promise<void> => {
  const annotationStreamDetails: AnnotationStreamDetail[] = await getAnnotationStreamsDetails()

  dispatch(setAnnotationStreams(annotationStreamDetails))
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
