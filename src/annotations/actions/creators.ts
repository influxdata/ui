import {Annotation, AnnotationResponse, AnnotationStream} from 'src/types'

export const DELETE_ANNOTATION = 'DELETE_ANNOTATION'
export const DISABLE_ANNOTATION_STREAM = 'DISABLE_ANNOTATION_STREAM'
export const SET_ANNOTATIONS = 'SET_ANNOTATIONS'
export const SET_ANNOTATION_STREAMS = 'SET_ANNOTATION_STREAMS'
export const TOGGLE_ANNOTATION_VISIBILITY = 'TOGGLE_ANNOTATION_VISIBILITY'
export const TOGGLE_SINGLE_CLICK_ANNOTATIONS = 'TOGGLE_SINGLE_CLICK_ANNOTATIONS'
export const EDIT_ANNOTATION = 'EDIT_ANNOTATION'

export type Action =
  | ReturnType<typeof deleteAnnotation>
  | ReturnType<typeof editAnnotation>
  | ReturnType<typeof setAnnotations>
  | ReturnType<typeof setAnnotationStreams>
  | ReturnType<typeof toggleAnnotationVisibility>
  | ReturnType<typeof toggleSingleClickAnnotations>

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

export const toggleSingleClickAnnotations = () =>
  ({
    type: TOGGLE_SINGLE_CLICK_ANNOTATIONS,
  } as const)

export const deleteAnnotation = (annotation: Annotation) =>
  ({
    type: DELETE_ANNOTATION,
    annotation,
  } as const)

export const editAnnotation = (annotation: Annotation) =>
  ({type: EDIT_ANNOTATION, annotation} as const)

export const toggleAnnotationVisibility = () =>
  ({
    type: TOGGLE_ANNOTATION_VISIBILITY,
  } as const)
