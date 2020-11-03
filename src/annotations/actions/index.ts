export type ActionTypes =
  | EnableAnnotationStreamAction
  | DisableAnnotationStreamAction

interface EnableAnnotationStreamAction {
  type: 'ENABLE_ANNOTATION_STREAM'
  streamID: string
}

interface DisableAnnotationStreamAction {
  type: 'DISABLE_ANNOTATION_STREAM'
  streamID: string
}

export const enableAnnotationStream = (
  streamID: string
): EnableAnnotationStreamAction => ({
  type: 'ENABLE_ANNOTATION_STREAM',
  streamID,
})

export const disableAnnotationStream = (
  streamID: string
): DisableAnnotationStreamAction => ({
  type: 'DISABLE_ANNOTATION_STREAM',
  streamID,
})
