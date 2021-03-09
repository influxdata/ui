// Types
import {AppState, AnnotationStream} from 'src/types'
import {sortBy} from 'lodash'

// Mocks
import {
  MOCK_ANNOTATION_STREAMS,
  AnnotationStream as MockAnnotationStream,
} from 'src/annotations/constants/mocks'

export const getAnnotationControlsVisibility = (state: AppState): boolean => {
  return state.userSettings.showAnnotationsControls || false
}

export const getVisibleAnnotationStreams = (
  state: AppState
): MockAnnotationStream[] => {
  const visibleStreams = state.annotations.visibleStreamsByID
  const filtered = MOCK_ANNOTATION_STREAMS.filter(stream =>
    visibleStreams.includes(stream.id)
  )

  return sortBy(filtered, stream => stream.name)
}

export const getHiddenAnnotationStreams = (
  state: AppState
): MockAnnotationStream[] => {
  const visibleStreams = state.annotations.visibleStreamsByID
  const filtered = MOCK_ANNOTATION_STREAMS.filter(
    stream => !visibleStreams.includes(stream.id)
  )

  return sortBy(filtered, stream => stream.name)
}

export const getAnnotationStreams = (state: AppState): AnnotationStream[] => {
  return state.annotations.streams
}

export const isSingleClickAnnotationsEnabled = (state: AppState): boolean => {
  return state.annotations.enableSingleClickAnnotations
}
