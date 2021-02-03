import {AnnotationStream} from 'src/types'

export const ENABLE_ANNOTATION_STREAM = 'ENABLE_ANNOTATION_STREAM'
export const DISABLE_ANNOTATION_STREAM = 'DISABLE_ANNOTATION_STREAM'

export const SET_ANNOTATIONS = 'SET_ANNOTATIONS'
export const DELETE_ANNOTATION = 'DELETE_ANNOTATION'

export type Action =
  | ReturnType<typeof enableAnnotationStream>
  | ReturnType<typeof disableAnnotationStream>
  | ReturnType<typeof setAnnotations>
  | ReturnType<typeof deleteAnnotation>


export const enableAnnotationStream = (streamID: string) =>
  ({
    type: ENABLE_ANNOTATION_STREAM,
    streamID,
  } as const)

export const disableAnnotationStream = (streamID: string) =>
  ({
    type: DISABLE_ANNOTATION_STREAM,
    streamID,
  } as const)

export const setAnnotations = (annotations: AnnotationStream[]) =>
  ({
    type: SET_ANNOTATIONS,
    annotations,
  } as const)

  export const deleteAnnotation = (annotationID: string) =>
  ({
    type: DELETE_ANNOTATION,
    annotationID,
  } as const)
