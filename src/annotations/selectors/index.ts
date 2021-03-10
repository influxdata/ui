// Types
import {AppState, AnnotationStream} from 'src/types'
import {sortBy} from 'lodash'

export const getAnnotationControlsVisibility = (state: AppState): boolean => {
  return state.userSettings.showAnnotationsControls || false
}

export const getVisibleAnnotationStreams = (state: AppState): string[] => {
  const visibleStreams = state.annotations.visibleStreamsByID

  return sortBy(visibleStreams, stream => stream)
}

export const getHiddenAnnotationStreams = (state: AppState): string[] => {
  const visibleStreams = state.annotations.visibleStreamsByID
  const filtered = state.annotations.streams
    .map(stream => stream.stream)
    .filter(stream => !visibleStreams.includes(stream))

  return sortBy(filtered, stream => stream)
}

export const getAnnotationStreams = (state: AppState): AnnotationStream[] => {
  return state.annotations.streams
}

export const isSingleClickAnnotationsEnabled = (state: AppState): boolean => {
  return state.annotations.enableSingleClickAnnotations
}
