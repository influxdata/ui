import {
  Action,
  ENABLE_ANNOTATION_STREAM,
  DISABLE_ANNOTATION_STREAM,
  SET_ANNOTATIONS,
} from 'src/annotations/actions/creators'

import {Annotation} from 'src/types'

export interface AnnotationsState {
  annotations: {[stream: string]: Annotation[]}
  visibleStreamsByID: string[]
}

export const initialState = (): AnnotationsState => ({
  annotations: {},
  visibleStreamsByID: [],
})

// TODO: use immer
export const annotationsReducer = (
  state = initialState(),
  action: Action
): AnnotationsState => {
  switch (action.type) {
    case ENABLE_ANNOTATION_STREAM: {
      return {
        ...state,
        visibleStreamsByID: [...state.visibleStreamsByID, action.streamID],
      }
    }
    case DISABLE_ANNOTATION_STREAM: {
      return {
        ...state,
        visibleStreamsByID: state.visibleStreamsByID.filter(
          streamID => streamID !== action.streamID
        ),
      }
    }
    case SET_ANNOTATIONS: {
      const annotations = {}
      action.annotations.forEach(annotationStream => {
        annotations[annotationStream.stream] = annotationStream.annotations
      })
      return {
        ...state,
        annotations,
      }
    }
    default:
      return state
  }
}
