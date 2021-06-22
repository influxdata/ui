// Libraries
import React, {FC, FormEvent, useState} from 'react'
import {useDispatch} from 'react-redux'
import moment from 'moment'

// Utils
import {event} from 'src/cloud/utils/reporting'
import classnames from 'classnames'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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
}

export const AnnotationForm: FC<Props> = (props: Props) => {
  const [startTime, setStartTime] = useState(props.startTime)
  const [endTime, setEndTime] = useState(props.endTime)
  const [summary, setSummary] = useState(props.summary)
  const [annotationType, setAnnotationType] = useState(props.type)

  const dispatch = useDispatch()

  const isValidAnnotationForm = (): boolean => {
    const isValidPointAnnotation = Boolean(summary?.length && startTime)

    // not checking if start <= end right now
    // initially, the times are numbers, and then if the user manually edits them then
    // they are strings, so the simple compare is non-trivial.
    // plus, the backend checks if the startTime is before or equals the endTime
    // so, letting the backend do that check for now.
    if (annotationType === 'range') {
      return Boolean(isValidPointAnnotation && endTime)
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
    props.onSubmit({
      summary,
      startTime,
      endTime,
      type: annotationType,
      id: props.annotationId,
      stream: props.stream,
    })
  }

  const handleDelete = () => {
    const editedAnnotation = {
      summary,
      startTime,
      endTime,
      type: annotationType,
      id: props.annotationId,
      stream: props.stream,
    }

    try {
      dispatch(deleteAnnotations(editedAnnotation))
      event(`${props.eventPrefix}.annotations.delete_annotation.success`)
      dispatch(notify(deleteAnnotationSuccess(editedAnnotation.summary)))
      props.onClose()
    } catch (err) {
      event(`${props.eventPrefix}.annotations.delete_annotation.failure`)
      dispatch(notify(deleteAnnotationFailed(err)))
    }
  }

  const handleCancel = () => {
    const annoMode = isEditing ? 'edit' : 'create'
    event(
      `${props.eventPrefix}.dashboards.annotations.${annoMode}_annotation.cancel`
    )
    props.onClose()
  }

  /**
   * if there is a problem with the end time (with respect to the start time)
   * return an error message here
   *
   * if no message, then it is valid
   * */
  const validateEndTime = () => {
    if (annotationType === 'point') {
      return ''
    }

    /**
     * if point annotation, do nothing
     *
     * if range:
     * making sure they are not the same, and also that 'end' is after 'start'
     */

    // console.log(`times??? ${startTime}: ${endTime}`)
    // console.log(`types??? ${typeof(startTime)} : ${typeof(endTime)}`)

    const start = moment(startTime)
    const end = moment(endTime)

    if (end.isSame(start)) {
      return 'End Time is the same as start time, please adjust or create a point annotation instead.'
    }

    if (!end.isAfter(start)) {
      return 'End Time must be after the start time'
    }
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
          {isFlagEnabled('rangeAnnotations') && annoTypePicker}
          <div className="annotation-type-option-line">
            <AnnotationTimeInput
              onChange={updateStartTime}
              onSubmit={handleKeyboardSubmit}
              time={startTime}
              name="startTime"
            />

            {annotationType === 'range' && (
              <AnnotationTimeInput
                onChange={updateEndTime}
                onSubmit={handleKeyboardSubmit}
                invalidMessage={validateEndTime()}
                time={endTime}
                name="endTime"
                titleText="Stop Time"
                style={{marginLeft: 10}}
              />
            )}
          </div>
          <AnnotationMessageInput
            message={summary}
            onChange={updateSummary}
            onSubmit={handleKeyboardSubmit}
          />
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
