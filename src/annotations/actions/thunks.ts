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
  editAnnotation as editAnnotationAction,
  deleteAnnotation as deleteAnnotationAction,
} from 'src/annotations/actions/creators'

import {
  Annotation,
  AnnotationStream,
  NotificationAction,
  GetState,
} from 'src/types'

// Selectors
import {getOrg} from 'src/organizations/selectors'

export const fetchAndSetAnnotationStreams = async (
  dispatch: Dispatch<AnnotationAction>
): Promise<void> => {
  const annotationStreams: AnnotationStream[] = await getAnnotationStreams()

  dispatch(setAnnotationStreams(annotationStreams))
}

export const fetchAndSetAnnotations =
  () =>
  async (
    dispatch: Dispatch<AnnotationAction>,
    getState: GetState
  ): Promise<void> => {
    const org = getOrg(getState())
    const annotations = await getAnnotations(org.id)

    dispatch(setAnnotations(annotations))
  }

export const writeThenFetchAndSetAnnotations =
  (annotations: Annotation[]) =>
  async (
    dispatch: Dispatch<AnnotationAction | NotificationAction>,
    getState: GetState
  ): Promise<void> => {
    const org = getOrg(getState())
    await writeAnnotation(annotations, org.id)

    fetchAndSetAnnotations()(dispatch, getState)
  }

export const deleteAnnotations =
  annotation =>
  async (dispatch: Dispatch<AnnotationAction | NotificationAction>) => {
      await deleteAnnotation({
        ...annotation,
        endTime: annotation.startTime,
      })
      dispatch(deleteAnnotationAction(annotation))
}

export const editAnnotation =
  annotation =>
  async (dispatch: Dispatch<AnnotationAction | NotificationAction>) => {
    let {endTime} = annotation
    if (annotation.type === 'point') {
      endTime = annotation.startTime
    }

    const updatedAnnotation = await updateAnnotation({
      ...annotation,
      endTime,
    })
    dispatch(editAnnotationAction(updatedAnnotation))
  }
