import {getAnnotations, writeAnnotation} from 'src/annotations/api'
import {Dispatch} from 'react'

import {
  setAnnotations,
  Action as AnnotationAction,
} from 'src/annotations/actions/creators'

import {Annotation} from 'src/types'

export const fetchAndSetAnnotations = () => async (
  dispatch: Dispatch<AnnotationAction>
): Promise<void> => {
  const annotations = await getAnnotations()

  dispatch(setAnnotations(annotations))
}

export const writeThenUpdateAnnotations = (annotations: Annotation[]) => async (
  dispatch: Dispatch<AnnotationAction>
): Promise<void> => {
  await writeAnnotation(annotations)

  dispatch(await fetchAndSetAnnotations())
}
