// Libraries
import React, {FC, FormEvent, useState} from 'react'
import {useDispatch} from 'react-redux'

// Utils
import {event} from 'src/cloud/utils/reporting'
import classnames from 'classnames'
import {getErrorMessage} from 'src/utils/api'

// Components
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Form,
  Overlay,
  SelectGroup,
} from '@influxdata/clockface'
import {AnnotationMessageInput} from 'src/annotations/components/annotationForm/AnnotationMessageInput'
import {AnnotationTimeInput} from 'src/annotations/components/annotationForm/AnnotationTimeInput'

import {deleteAnnotations} from 'src/annotations/actions/thunks'
// Notifications
import {
  deleteAnnotationFailed,
  deleteAnnotationSuccess,
} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

// Constants
import {ANNOTATION_FORM_WIDTH} from 'src/annotations/constants'

// Style
import 'src/annotations/components/annotationForm/annotationForm.scss'
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'

type AnnotationType = 'point' | 'range'

interface Props {
  startTime: string
  endTime?: string
  title: 'Edit' | 'Add'
  annotationId?: string
  summary?: string
  stream?: string
  type: AnnotationType
  onSubmit: (Annotation) => void
  onClose: () => void
  eventPrefix: string
  getNow?: () => number
  timeFormat?: string
}
export const WRONG_ORDER_MESSAGE = 'Stop Time must be after the start time'
export const END_TIME_IN_FUTURE_MESSAGE = 'Stop Time cannot be in the future'
export const TIMES_ARE_SAME_MESSAGE = 'Stop Time must be after the start time'
export const START_TIME_IN_FUTURE_MESSAGE = 'Start Time cannot be in the future'

/**
 *  Form for editing and creating annotations.
 *  It does support multi-line annotations, but the tradeoff is that the user cannot then press 'return' to submit the form.
 * */
export const AnnotationForm: FC<Props> = (props: Props) => {
  const [startTime, setStartTime] = useState(props.startTime)
  const [endTime, setEndTime] = useState(props.endTime)
  const [summary, setSummary] = useState(props.summary)
  const [annotationType, setAnnotationType] = useState(props.type)

  const timeFormat = props.timeFormat ? props.timeFormat : DEFAULT_TIME_FORMAT

  // is the time by itself valid? (is the format valid)
  // since we start with default times via the mouse, the formats are valid at first
  // (until the user edits it)
  const [endTimeFormatValid, setEndTimeFormatValid] = useState(true)
  const [startTimeFormatValid, setStartTimeFormatValid] = useState(true)

  const dispatch = useDispatch()

  const isValidAnnotationForm = (): boolean => {
    const isValidPointAnnotation =
      summary?.length && startTime && startTimeFormatValid && isStartTimeValid()

    if (annotationType === 'range') {
      return (
        isValidPointAnnotation &&
        endTime &&
        endTimeFormatValid &&
        isEndTimeValid()
      )
    }
    return isValidPointAnnotation
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    props.onSubmit({
      summary,
      startTime,
      endTime,
      type: annotationType,
      id: props.annotationId,
      stream: props.stream,
    })
  }

  const updateSummary = (newSummary: string): void => {
    setSummary(newSummary)
  }

  const updateStartTime = (newTime: string): void => {
    setStartTime(newTime)
  }

  const updateEndTime = (newTime: string): void => {
    setEndTime(newTime)
  }

  const handleKeyboardSubmit = () => {
    if (isValidAnnotationForm()) {
      props.onSubmit({
        summary,
        startTime,
        endTime,
        type: annotationType,
        id: props.annotationId,
        stream: props.stream,
      })
    }
  }

  const handleDelete = async () => {
    const editedAnnotation = {
      summary,
      startTime,
      endTime,
      type: annotationType,
      id: props.annotationId,
      stream: props.stream,
    }

    try {
      await dispatch(deleteAnnotations(editedAnnotation))
      event(`annotations.delete_annotation.success`, {
        prefix: props.eventPrefix,
      })
      dispatch(notify(deleteAnnotationSuccess(editedAnnotation.summary)))
      props.onClose()
    } catch (err) {
      event(`annotations.delete_annotation.failure`, {
        prefix: props.eventPrefix,
      })
      dispatch(notify(deleteAnnotationFailed(getErrorMessage(err))))
    }
  }

  const handleCancel = () => {
    const annoMode = isEditing ? 'edit' : 'create'
    event(`dashboards.annotations.cancel`, {
      prefix: props.eventPrefix,
      mode: annoMode,
    })
    props.onClose()
  }

  const isTimeAfter = (time1: Date, time2: Date): boolean => {
    return time1.getTime() > time2.getTime()
  }

  /**
   * timeToCheck is either a string or a number, moment does the conversion for us.
   * at first; it's a number like:  1626185380000
   * then, if the user edits it, then it's a string: like:  2021-07-13T15:31:40.000Z
   * */
  const isTimeInFuture = (timeToCheck): boolean => {
    let now = null
    if (props.getNow) {
      now = new Date(props.getNow())
    } else {
      now = new Date()
    }

    return isTimeAfter(new Date(timeToCheck), now)
  }

  interface ValidityInfo {
    message?: string
    isValid: boolean
  }

  const validateStartTime = (): ValidityInfo => {
    if (isTimeInFuture(startTime)) {
      return {isValid: false, message: START_TIME_IN_FUTURE_MESSAGE}
    }
    return {isValid: true}
  }

  /**
   * If there is a problem with the end time (with respect to the start time)
   * return an error message here, along with the isValid flag
   *
   * If no message, then it is valid (just return a true isValid flag)
   *
   * since this is only vaild for range annotations, if it is a point annotations just return true
   * */
  const validateEndTime = (): ValidityInfo => {
    if (annotationType === 'point') {
      return {isValid: true}
    }

    /**
     * if point annotation, do nothing
     *
     * if range:
     * making sure they are not the same, and also that 'end' is after 'start'
     */

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end.getTime() === start.getTime()) {
      return {
        isValid: false,
        message: TIMES_ARE_SAME_MESSAGE,
      }
    }

    if (!isTimeAfter(end, start)) {
      return {isValid: false, message: WRONG_ORDER_MESSAGE}
    }

    if (isTimeInFuture(endTime)) {
      return {isValid: false, message: END_TIME_IN_FUTURE_MESSAGE}
    }

    return {isValid: true, message: null}
  }

  const getEndTimeValidationMessage = (): string => {
    return validateEndTime().message
  }

  const isEndTimeValid = (): boolean => {
    return validateEndTime().isValid
  }

  const getStartTimeValidationMessage = (): string => {
    return validateStartTime().message
  }

  const isStartTimeValid = (): boolean => {
    return validateStartTime().isValid
  }

  const changeToRangeType = () => {
    setAnnotationType('range')
    if (!endTime) {
      setEndTime(startTime)
    }
  }

  const changeToPointType = () => {
    setAnnotationType('point')
  }

  const isEditing = Boolean(props.annotationId)

  const saveTextSuffix = isEditing ? 'Changes' : 'Annotation'

  const footerClasses = classnames('annotation-form-footer', {
    'edit-annotation-form-footer': isEditing,
  })

  const buttonClasses = classnames({'edit-annotation-buttons': isEditing})

  const annoTypePicker = (
    <React.Fragment>
      <Form.Label label="Type" />
      <SelectGroup
        size={ComponentSize.Small}
        style={{marginBottom: 8}}
        color={ComponentColor.Default}
      >
        <SelectGroup.Option
          onClick={changeToPointType}
          active={'point' === annotationType}
          id="annotation-form-point-type"
          testID="annotation-form-point-type-option"
          value="point"
        >
          Point
        </SelectGroup.Option>
        <SelectGroup.Option
          onClick={changeToRangeType}
          value="range"
          active={'range' === annotationType}
          id="annotation-form-range-type"
          testID="annotation-form-range-type-option"
        >
          Range
        </SelectGroup.Option>
      </SelectGroup>
    </React.Fragment>
  )

  return (
    <Overlay.Container maxWidth={ANNOTATION_FORM_WIDTH}>
      <Overlay.Header
        title={`${props.title} Annotation`}
        onDismiss={handleCancel}
        className="edit-annotation-head"
      />
      <Form onSubmit={handleSubmit}>
        <Overlay.Body>
          {annoTypePicker}
          <div className="annotation-type-option-line">
            <AnnotationTimeInput
              onChange={updateStartTime}
              onSubmit={handleKeyboardSubmit}
              time={startTime}
              timeFormat={timeFormat}
              name="startTime"
              onValidityCheck={setStartTimeFormatValid}
              invalidMessage={getStartTimeValidationMessage()}
            />

            {annotationType === 'range' && (
              <AnnotationTimeInput
                onChange={updateEndTime}
                onSubmit={handleKeyboardSubmit}
                invalidMessage={getEndTimeValidationMessage()}
                onValidityCheck={setEndTimeFormatValid}
                time={endTime}
                timeFormat={timeFormat}
                name="endTime"
                titleText="Stop Time"
                style={{marginLeft: 10}}
              />
            )}
          </div>
          <AnnotationMessageInput message={summary} onChange={updateSummary} />
        </Overlay.Body>
        <Overlay.Footer className={footerClasses}>
          {isEditing && (
            <Button
              text="Delete Annotation"
              onClick={handleDelete}
              color={ComponentColor.Danger}
              style={{marginRight: '15px'}}
              testID="delete-annotation-button"
            />
          )}
          <div className={buttonClasses}>
            <Button
              text="Cancel"
              color={ComponentColor.Tertiary}
              onClick={handleCancel}
              testID="edit-annotation-cancel-button"
              className="edit-annotation-cancel"
            />
            <Button
              text={`Save ${saveTextSuffix}`}
              color={ComponentColor.Primary}
              type={ButtonType.Submit}
              status={
                isValidAnnotationForm()
                  ? ComponentStatus.Default
                  : ComponentStatus.Disabled
              }
              testID="annotation-submit-button"
            />
          </div>
        </Overlay.Footer>
      </Form>
    </Overlay.Container>
  )
}
