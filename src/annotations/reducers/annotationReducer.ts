// Libraries
import {useState} from 'react'
import {ComponentStatus} from '@influxdata/clockface'

type AnnotationField =
  | 'summary'
  | 'type'
  | 'startTime'
  | 'stopTime'
  | 'message'
  | 'stream'

type AnnotationType = 'point' | 'range'

type FormState = 'initial' | 'valid' | 'errors'

export const useAnnotationForm = (annotationType: AnnotationType) => {
  // Values
  const [summary, updateSummary] = useState<string>('')
  const [type, updateType] = useState<AnnotationType>(annotationType)
  const [startTime, updateStartTime] = useState<string>('')
  const [stopTime, updateStopTime] = useState<string>('')
  const [message, updateMessage] = useState<string>('')
  const [stream, updateStream] = useState<string>('')

  // Errors
  const [summaryError, updateSummaryError] = useState<string>('')
  const [startTimeError, updateStartTimeError] = useState<string>('')
  const [stopTimeError, updateStopTimeError] = useState<string>('')

  // Statuses
  const [summaryStatus, updateSummaryStatus] = useState<ComponentStatus>(
    ComponentStatus.Default
  )
  const [startTimeStatus, updateStartTimeStatus] = useState<ComponentStatus>(
    ComponentStatus.Default
  )
  const [stopTimeStatus, updateStopTimeStatus] = useState<ComponentStatus>(
    ComponentStatus.Default
  )

  const values = {
    summary,
    type,
    startTime,
    stopTime,
    message,
    stream,
  }

  const errors = {
    summary: summaryError,
    startTime: startTimeError,
    stopTime: stopTimeError,
  }

  const statuses = {
    summary: summaryStatus,
    startTime: startTimeStatus,
    stopTime: stopTimeStatus,
  }

  const set = (field: AnnotationField) => (value: any): void => {
    switch (field) {
      case 'summary':
        return updateSummary(value.target.value)
      case 'type':
        return updateType(value)
      case 'startTime':
        if (type === 'point') {
          updateStartTime(value.target.value)
          updateStopTime(value.target.value)
        } else if (type === 'range') {
          updateStartTime(value.target.value)
        }
        return
      case 'stopTime':
        return updateStopTime(value.target.value)
      case 'message':
        return updateMessage(value.target.value)
      case 'stream':
        return updateStream(value)
    }
  }

  const validate = (): FormState => {
    let errorCount = 0
    if (summary === '') {
      updateSummaryError('This field cannot be blank')
      updateSummaryStatus(ComponentStatus.Error)
      errorCount++
    } else {
      updateSummaryError('')
      updateSummaryStatus(ComponentStatus.Valid)
    }

    if (startTime === '') {
      updateStartTimeError('This field cannot be blank')
      updateStartTimeStatus(ComponentStatus.Error)
      errorCount++
    } else {
      updateStartTimeError('')
      updateStartTimeStatus(ComponentStatus.Valid)
    }

    if (stopTime === '') {
      updateStopTimeError('This field cannot be blank')
      updateStopTimeStatus(ComponentStatus.Error)
      errorCount++
    } else {
      updateStopTimeError('')
      updateStopTimeStatus(ComponentStatus.Valid)
    }

    return errorCount === 0 ? 'valid' : 'errors'
  }

  return {
    values,
    errors,
    statuses,
    set,
    validate,
  }
}
