// Types
import {AppState} from 'src/types'
import {sortBy} from 'lodash'

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
  const filtered = MOCK_ANNOTATION_STREAMS.filter(stream =>
    visibleStreams.includes(stream.id)
  )

  return sortBy(filtered, stream => stream.name)
}

export const getHiddenAnnotationStreams = (
  state: AppState
): AnnotationStream[] => {
  const visibleStreams = state.annotations.visibleStreamsByID
  const filtered = MOCK_ANNOTATION_STREAMS.filter(
    stream => !visibleStreams.includes(stream.id)
  )

  return sortBy(filtered, stream => stream.name)
}
