// Libraries
import {ComponentStatus} from '@influxdata/clockface'

// Types
import {AnnotationStream} from 'src/annotations/constants/mocks'

export type AnnotationType = 'point' | 'range'
export interface ReducerState {
  summary: {
    value: string
    status: ComponentStatus
    error: string
  }
  type: AnnotationType
  timeStart: {
    value: string
    status: ComponentStatus
    error: string
  }
  timeStop: {
    value: string
    status: ComponentStatus
    error: string
  }
  message: {
    value: string
    status: ComponentStatus
    error: string
  }
  // These fields are for where to write the annotation once it's done
  streamID?: string
  bucketName?: string
  measurement?: string
  tags?: {
    [key: string]: string
  }
}

interface UpdateSummaryAction {
  type: 'updateSummary'
  payload: string
}

interface UpdateTypeAction {
  type: 'updateType'
  payload: AnnotationType
}

interface UpdateTimeStartAction {
  type: 'updateTimeStart'
  payload: string
}

interface UpdateTimeStopAction {
  type: 'updateTimeStop'
  payload: string
}

interface UpdateMessageAction {
  type: 'updateMessage'
  payload: string
}

interface UpdateStreamAction {
  type: 'updateStream'
  payload: AnnotationStream
}

export type ReducerActionType =
  | UpdateSummaryAction
  | UpdateTypeAction
  | UpdateTimeStartAction
  | UpdateTimeStopAction
  | UpdateMessageAction
  | UpdateStreamAction

export const getInitialAnnotationState = (
  type: AnnotationType,
  start: string,
  stop: string,
  summaryText?: string,
  messageText?: string
): ReducerState => {
  const summary = {
    value: summaryText || '',
    status: ComponentStatus.Default,
    error: '',
  }

  const timeStart = {
    value: start,
    status: ComponentStatus.Default,
    error: '',
  }

  const timeStop = {
    value: stop,
    status: ComponentStatus.Default,
    error: '',
  }

  const message = {
    value: messageText || '',
    status: ComponentStatus.Default,
    error: '',
  }

  return {
    summary,
    type,
    timeStart,
    timeStop,
    message,
  }
}

export const annotationReducer = (
  state: ReducerState,
  action: ReducerActionType
) => {
  switch (action.type) {
    case 'updateSummary':
      let summary = state.summary
      if (action.payload === '') {
        summary = {
          ...state.summary,
          value: action.payload,
          status: ComponentStatus.Error,
          error: 'This field is required',
        }
      } else if (action.payload !== '') {
        summary = {
          ...state.summary,
          value: action.payload,
          status: ComponentStatus.Valid,
          error: '',
        }
      }
      return {...state, summary}

    case 'updateType':
      return {...state, type: action.payload}

    case 'updateTimeStart':
      let timeStart = state.timeStart
      if (action.payload === '') {
        timeStart = {
          ...state.timeStart,
          value: action.payload,
          status: ComponentStatus.Error,
          error: 'This field is required',
        }
      } else if (action.payload !== '') {
        timeStart = {
          ...state.timeStart,
          value: action.payload,
          status: ComponentStatus.Valid,
          error: '',
        }
      }
      return {...state, timeStart}

    case 'updateTimeStop':
      let timeStop = state.timeStop
      if (action.payload === '') {
        timeStop = {
          ...state.timeStop,
          value: action.payload,
          status: ComponentStatus.Error,
          error: 'This field is required',
        }
      } else if (action.payload !== '') {
        timeStop = {
          ...state.timeStop,
          value: action.payload,
          status: ComponentStatus.Valid,
          error: '',
        }
      }
      return {...state, timeStop}

    case 'updateMessage':
      return {
        ...state,
        message: {...state.message, value: action.payload},
      }

    case 'updateStream':
      return {
        ...state,
        streamID: action.payload.id,
        bucketName: action.payload.query.bucketName,
        measurement: action.payload.query.measurement,
        tags: action.payload.query.tags,
      }
  }
}
