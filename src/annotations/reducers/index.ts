import {
  Action,
  DELETE_ANNOTATION,
  DISABLE_ANNOTATION_STREAM,
  ENABLE_ANNOTATION_STREAM,
  SET_ANNOTATIONS,
  SET_ANNOTATION_STREAMS,
  TOGGLE_ANNOTATION_VISIBILITY,
  TOGGLE_SINGLE_CLICK_ANNOTATIONS,
  EDIT_ANNOTATION,
} from 'src/annotations/actions/creators'

import {Annotation, AnnotationsList, AnnotationStream} from 'src/types'

import {InfluxColors} from '@influxdata/clockface'

export interface AnnotationsState {
  streams: AnnotationStream[]
  annotations: AnnotationsList
  annotationsAreVisible: boolean // a temporary (we'll see) measure until we enable streams
  visibleStreamsByID: string[]
  enableSingleClickAnnotations: boolean
}

export const FALLBACK_COLOR = InfluxColors.Curacao

export const STREAM_COLOR_LIST = [InfluxColors.Potassium]

export const initialState = (): AnnotationsState => ({
  annotations: {
    default: [] as Annotation[],
  },
  annotationsAreVisible: true,
  enableSingleClickAnnotations: false,
  streams: [
    {
      stream: 'default',
      color: InfluxColors.Potassium,
    },
  ],
  visibleStreamsByID: ['default'],
})

export const annotationsReducer = (
  state = initialState(),
  action: Action
): AnnotationsState => {
  switch (action.type) {
    case SET_ANNOTATION_STREAMS: {
      return {
        ...state,
        streams: action.streams.map((stream, i) => {
          return {
            ...stream,
            color: STREAM_COLOR_LIST[i],
          }
        }),
      }
    }
    case DELETE_ANNOTATION: {
      return {
        ...state,
        annotations: {
          default: state.annotations['default'].filter(
            annotation => annotation.id !== action.annotation.id
          ),
        },
      }
    }

    case EDIT_ANNOTATION: {
      const stream = action.annotation.stream
      const cellAnnotations = [...state.annotations[stream]]
      const annotations = {...state.annotations}

      annotations[stream] = cellAnnotations.map(annotation => {
        if (annotation.id === action.annotation.id) {
          return action.annotation
        }
        return annotation
      })

      return {
        ...state,
        annotations
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

    case TOGGLE_ANNOTATION_VISIBILITY: {
      return {
        ...state,
        annotationsAreVisible: !state.annotationsAreVisible,
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
