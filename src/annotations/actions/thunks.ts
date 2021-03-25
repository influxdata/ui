import {
  deleteAnnotation,
  getAnnotations,
  getAnnotationStreams,
  updateAnnotation,
  writeAnnotation,
} from 'src/annotations/api'
import {notify} from 'src/shared/actions/notifications'
import {
  deleteAnnotationSuccess,
  deleteAnnotationFailed,
  createAnnotationFailed,
  editAnnotationSuccess,
  editAnnotationFailed,
} from 'src/shared/copy/notifications'
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
  try {
    await writeAnnotation(annotations)

    fetchAndSetAnnotations()(dispatch)
  } catch (err) {
    dispatch(notify(createAnnotationFailed(err)))
  }
}
export const deleteAnnotations = annotation => async (
  dispatch: Dispatch<AnnotationAction | NotificationAction>
) => {
  try {
    await deleteAnnotation({
      ...annotation,
      endTime: annotation.startTime,
      stream: 'default',
    })
    dispatch(deleteAnnotationAction(annotation))
    dispatch(notify(deleteAnnotationSuccess()))
  } catch (err) {
    dispatch(notify(deleteAnnotationFailed(err)))
  }
}

export const editAnnotation = annotation => async (
  dispatch: Dispatch<AnnotationAction | NotificationAction>
) => {
  try {
    const updatedAnnotation = await updateAnnotation({
      ...annotation,
      endTime: annotation.startTime,
    })
    dispatch(patchAnnotation(updatedAnnotation))
    dispatch(notify(editAnnotationSuccess()))
  } catch (err) {
    dispatch(notify(editAnnotationFailed(err)))
  }
}
