import {
  Action,
  DISABLE_ANNOTATION_STREAM,
  ENABLE_ANNOTATION_STREAM,
  SET_ANNOTATIONS,
  SET_ANNOTATION_STREAMS,
  TOGGLE_ANNOTATION_VISIBILITY,
  TOGGLE_SINGLE_CLICK_ANNOTATIONS,
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

const STREAM_COLOR_LIST = [InfluxColors.Potassium]

export const initialState = (): AnnotationsState => ({
  annotations: {
    default: [] as Annotation[],
  },
  annotationsAreVisible: true,
  enableSingleClickAnnotations: true,
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
