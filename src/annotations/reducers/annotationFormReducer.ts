// Libraries
import {ComponentStatus} from '@influxdata/clockface'

// Types
import {Dispatch} from 'react'
import {
  AnnotationActionType,
  updateAnnotationDraft,
} from 'src/annotations/actions/annotationFormActions'

export type AnnotationType = 'point' | 'range'

export interface Annotation {
  summary: string
  type: AnnotationType
  timeStart: string
  timeStop: string
  message: string
  streamID: string
  bucketName?: string
  measurement?: string
  tags: {
    [key: string]: string
  }
}

export interface AnnotationDraft {
  summary: string
  summaryError: string
  summaryStatus: ComponentStatus
  type: AnnotationType
  timeStart: string
  timeStartError: string
  timeStartStatus: ComponentStatus
  timeStop: string
  timeStopError: string
  timeStopStatus: ComponentStatus
  message: string
  // These fields are for where to write the annotation once it's done
  streamID: string
  streamIDError: string
  bucketName?: string
  measurement?: string
  tags: {
    [key: string]: string
  }
}

export const getInitialAnnotationState = (
  type: AnnotationType,
  timeStart: string,
  timeStop: string,
  summaryText?: string,
  messageText?: string,
  stream?: string
): AnnotationDraft => {
  return {
    summary: summaryText || '',
    summaryError: '',
    summaryStatus: ComponentStatus.Default,
    type,
    timeStart,
    timeStartError: '',
    timeStartStatus: ComponentStatus.Default,
    timeStop,
    timeStopError: '',
    timeStopStatus: ComponentStatus.Default,
    message: messageText || '',
    tags: {},
    streamID: stream || '',
    streamIDError: '',
  }
}

export const annotationFormReducer = (
  state: AnnotationDraft,
  action: AnnotationActionType
) => {
  switch (action.type) {
    case 'updateAnnotationDraft':
      let updatedState = {
        ...state,
        ...action.payload,
      }

      if ('summary' in action.payload) {
        const invalidSummary = !action.payload.summary

        updatedState = {
          ...updatedState,
          summaryError: invalidSummary ? 'This field is required' : '',
          summaryStatus: invalidSummary
            ? ComponentStatus.Error
            : ComponentStatus.Valid,
        }
      }

      if ('timeStart' in action.payload) {
        const invalidSummary = !action.payload.timeStart

        updatedState = {
          ...updatedState,
          timeStop:
            state.type === 'point' ? action.payload.timeStart : state.timeStop,
          timeStartError: invalidSummary ? 'This field is required' : '',
          timeStartStatus: invalidSummary
            ? ComponentStatus.Error
            : ComponentStatus.Valid,
        }
      }

      if ('timeStop' in action.payload) {
        const invalidSummary = !action.payload.timeStop

        updatedState = {
          ...updatedState,
          timeStopError: invalidSummary ? 'This field is required' : '',
          timeStopStatus: invalidSummary
            ? ComponentStatus.Error
            : ComponentStatus.Valid,
        }
      }

      if ('streamID' in action.payload) {
        const invalidStreamID = !action.payload.streamID

        updatedState = {
          ...updatedState,
          streamIDError: invalidStreamID
            ? 'Choose a stream to insert this annotation into'
            : '',
        }
      }

      return updatedState
  }
}

export const annotationFormIsValid = (
  state: AnnotationDraft,
  dispatch: Dispatch<AnnotationActionType>
): boolean => {
  const {summaryError, timeStartError, timeStopError, streamID} = state

  // When submit is clicked
  // force required inputs into error or valid state (instead of initial)
  // so user can resolve the form errors and submit again
  dispatch(updateAnnotationDraft(state))

  if (summaryError || timeStartError || timeStopError || !streamID) {
    return false
  }

  return true
}

export const getAnnotationFromDraft = (draft: AnnotationDraft): Annotation => {
  return {
    summary: draft.summary,
    type: draft.type,
    timeStart: draft.timeStart,
    timeStop: draft.timeStop,
    message: draft.message,
    streamID: draft.streamID,
    bucketName: draft.bucketName,
    measurement: draft.measurement,
    tags: draft.tags,
  }
}
