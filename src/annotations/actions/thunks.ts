import {
  deleteAnnotation,
  getAnnotations,
  getAnnotationStreams,
  updateAnnotation,
  writeAnnotation,
} from 'src/annotations/api'
import {Dispatch} from 'react'
import {
  setAnnotations,
  setAnnotationStreams,
  Action as AnnotationAction,
  editAnnotation as patchAnnotation,
  deleteAnnotation as deleteAnnotationAction,
} from 'src/annotations/actions/creators'

import {Annotation, AnnotationStream, NotificationAction} from 'src/types'

export const fetchAndSetAnnotationStreams = async (
  dispatch: Dispatch<AnnotationAction>
): Promise<void> => {
  const annotationStreams: AnnotationStream[] = await getAnnotationStreams()

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
) => async (
  dispatch: Dispatch<AnnotationAction | NotificationAction>
): Promise<void> => {
  await writeAnnotation(annotations)

  fetchAndSetAnnotations()(dispatch)
}
export const deleteAnnotations = annotation => async (
  dispatch: Dispatch<AnnotationAction | NotificationAction>
) => {
  await deleteAnnotation({
    ...annotation,
    endTime: annotation.startTime,
    stream: 'default',
  })
  dispatch(deleteAnnotationAction(annotation))
}

export const editAnnotation = annotation => async (
  dispatch: Dispatch<AnnotationAction | NotificationAction>
) => {
  const updatedAnnotation = await updateAnnotation({
    ...annotation,
    endTime: annotation.startTime,
  })
  dispatch(patchAnnotation(updatedAnnotation))
}
