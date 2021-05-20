import {AnnotationResponse, AnnotationStream} from 'src/types'

import {AnnotationEvent} from 'src/client/annotationdRoutes'

export const DELETE_ANNOTATION = 'DELETE_ANNOTATION'
export const SET_ANNOTATIONS = 'SET_ANNOTATIONS'
export const SET_ANNOTATION_STREAMS = 'SET_ANNOTATION_STREAMS'
export const TOGGLE_ANNOTATIONS_VISIBILITY = 'TOGGLE_ANNOTATIONS_VISIBILITY'
export const TOGGLE_ANNOTATIONS_WRITE_MODE = 'TOGGLE_ANNOTATIONS_WRITE_MODE'
export const EDIT_ANNOTATION = 'EDIT_ANNOTATION'

export type Action =
  | ReturnType<typeof deleteAnnotation>
  | ReturnType<typeof editAnnotation>
  | ReturnType<typeof setAnnotations>
  | ReturnType<typeof setAnnotationStreams>
  | ReturnType<typeof setAnnotationsVisibility>
  | ReturnType<typeof setAnnotationsWriteMode>

export const setAnnotations = (annotations: AnnotationResponse[]) =>
  ({
    type: SET_ANNOTATIONS,
    annotations,
  } as const)

export const setAnnotationStreams = (streams: AnnotationStream[]) =>
  ({
    type: SET_ANNOTATION_STREAMS,
    streams,
  } as const)

export const setAnnotationsWriteMode = (isEnabled: boolean) =>
  ({
    type: TOGGLE_ANNOTATIONS_WRITE_MODE,
    isEnabled,
  } as const)

export const deleteAnnotation = (annotation: AnnotationEvent) =>
  ({
    type: DELETE_ANNOTATION,
    annotation,
  } as const)

export const editAnnotation = (annotation: AnnotationEvent) =>
  ({type: EDIT_ANNOTATION, annotation} as const)

export const setAnnotationsVisibility = (isVisible: boolean) =>
  ({
    type: TOGGLE_ANNOTATIONS_VISIBILITY,
    isVisible,
  } as const)
