import {AnnotationStream} from 'src/types'

export const ENABLE_ANNOTATION_STREAM = 'ENABLE_ANNOTATION_STREAM'
export const DISABLE_ANNOTATION_STREAM = 'DISABLE_ANNOTATION_STREAM'

export const SET_ANNOTATIONS = 'SET_ANNOTATIONS'

export type Action =
  | ReturnType<typeof enableAnnotationStream>
  | ReturnType<typeof disableAnnotationStream>
  | ReturnType<typeof setAnnotations>

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
