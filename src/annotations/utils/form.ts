import {AnnotationDraft} from 'src/annotations/reducers/annotationFormReducer'

export const annotationFormIsValid = (
  annotationDraftState: AnnotationDraft
): boolean => {
  const {
    summaryError,
    timeStartError,
    timeStopError,
    streamID,
  } = annotationDraftState

  if (summaryError || timeStartError || timeStopError || !streamID) {
    return false
  }

  return true
}
