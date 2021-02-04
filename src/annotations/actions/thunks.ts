import {getAnnotations, writeAnnotation} from 'src/annotations/api'
import {Dispatch} from 'react'
import {deleteAnnotation} from 'src/annotations/actions/creators'
import * as api from 'src/client'
import * as copy from 'src/shared/copy/notifications'

import {notify} from 'src/shared/actions/notifications'

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

export const writeThenFetchAndSetAnnotations = (
  annotations: Annotation[]
) => async (dispatch: Dispatch<AnnotationAction>): Promise<void> => {
  await writeAnnotation(annotations)

  fetchAndSetAnnotations()(dispatch)
}

export const deleteAnnotations = (id: string) => async (
  dispatch: Dispatch<AnnotationAction>
) => {
  try {
    const resp = await api.deleteAnnotations({variableID: id})
    if (resp.status !== 204) {
      throw new Error(resp.data.message)
    }
    dispatch(deleteAnnotation(id))
    dispatch(notify(copy.deleteAnnotationSuccess()))
  } catch (error) {
    console.error(error)
    dispatch(notify(copy.deleteAnnotationFailed(error.message)))
  }
