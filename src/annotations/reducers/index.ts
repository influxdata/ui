import {
  Action,
  ENABLE_ANNOTATION_STREAM,
  DISABLE_ANNOTATION_STREAM,
  SET_ANNOTATIONS,
  SET_ANNOTATION_STREAMS,
  TOGGLE_SINGLE_CLICK_ANNOTATIONS,
} from 'src/annotations/actions/creators'

import {Annotation, AnnotationsList, AnnotationStreamDetail} from 'src/types'

export interface AnnotationsState {
  streams: AnnotationStreamDetail[]
  annotations: AnnotationsList
  visibleStreamsByID: string[]
  enableSingleClickAnnotations: boolean
}

export const initialState = (): AnnotationsState => ({
  annotations: {
    default: [] as Annotation[],
  },
  visibleStreamsByID: [],
  streams: [],
  enableSingleClickAnnotations: true,
})

// TODO: use immer
export const annotationsReducer = (
  state = initialState(),
  action: Action
): AnnotationsState => {
  switch (action.type) {
    case SET_ANNOTATION_STREAMS: {
      return {
        ...state,
        streams: action.streams,
      }
    }
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

    case TOGGLE_SINGLE_CLICK_ANNOTATIONS: {
      const newVal = !state.enableSingleClickAnnotations

      return {
        ...state,
        enableSingleClickAnnotations: newVal,
      }
    }
    default:
      return state
  }
}
