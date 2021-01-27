import {getAnnotations} from 'src/annotations/api'
import {Dispatch} from 'react'

import {
  setAnnotations,
  Action as AnnotationAction,
} from 'src/annotations/actions/creators'

export const fetchAndSetAnnotations = () => async (
  dispatch: Dispatch<AnnotationAction>
): Promise<void> => {
  const annotations = await getAnnotations()

  dispatch(setAnnotations(annotations))
}
