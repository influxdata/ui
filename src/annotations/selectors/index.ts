// Types
import {AppState, AnnotationStream} from 'src/types'
import {sortBy} from 'lodash'

export const getVisibleAnnotationStreams = (state: AppState): string[] => {
  const visibleStreams = state.annotations.visibleStreamsByID

  return sortBy(visibleStreams, stream => stream)
}

export const getHiddenAnnotationStreams = (state: AppState): string[] => {
  const visibleStreams = state.annotations.visibleStreamsByID
  const filtered = state.annotations.streams
    .filter(stream => !visibleStreams.includes(stream.stream))
    .map(stream => stream.stream)

  return sortBy(filtered, stream => stream)
}

export const getAnnotationStreams = (state: AppState): AnnotationStream[] => {
  return state.annotations.streams
}

export const isAnnotationsModeEnabled = (state: AppState): boolean => {
  return state.annotations.enableAnnotationsMode
}
