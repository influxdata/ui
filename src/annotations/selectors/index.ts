// Types
import {AppState} from 'src/types'

// Mocks
import {
  MOCK_ANNOTATION_STREAMS,
  AnnotationStream,
} from 'src/annotations/constants/mocks'

export const getAnnotationControlsVisibility = (state: AppState): boolean => {
  return state.userSettings.showAnnotationsControls || false
}

export const getVisibleAnnotationStreams = (
  state: AppState
): AnnotationStream[] => {
  const visibleStreams = state.annotations.visibleStreamsByID

  return MOCK_ANNOTATION_STREAMS.filter(stream =>
    visibleStreams.includes(stream.id)
  )
}

export const getHiddenAnnotationStreams = (
  state: AppState
): AnnotationStream[] => {
  const visibleStreams = state.annotations.visibleStreamsByID

  return MOCK_ANNOTATION_STREAMS.filter(
    stream => !visibleStreams.includes(stream.id)
  )
}
