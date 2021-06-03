// Libraries
import React, {FC, FormEvent, useState} from 'react'
import {useDispatch} from 'react-redux'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Components
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Form,
  Grid,
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

interface Annotation {
  message: string
  startTime: number | string
}

type AnnotationType = 'point' | 'range'

interface Props {
  startTime: string
  endTime?: string
  title: 'Edit' | 'Add'
  id?: string
  summary?: string
  stream?: string
  type: AnnotationType
  onSubmit: (Annotation) => void
  onClose: () => void
}

export const isValidAnnotation = (
  annotationType: string,
  summary: string,
  startTime: any,
  endTime: any
) => {
  const isValidPointAnnotation = summary && summary.length && startTime

  console.log(
    'in valid check....',
    isValidPointAnnotation,
    annotationType,
    endTime
  )
  // not checking if start <= end right now
  // initially, the times are numbers, and then if the user manually edits them then
  // they are strings, so the simple compare is non-trivial.
  // plus, the backend checks if the startTime is before or equals the endTime
  // so, letting the backend do that check for now.
  if (annotationType === 'range') {
    const result = isValidPointAnnotation && endTime
    console.log('is range (77b)', result)
    return result
  }
  return isValidPointAnnotation
}

export const AnnotationForm: FC<Props> = (props: Props) => {
  const [startTime, setStartTime] = useState(props.startTime)
  const [endTime, setEndTime] = useState(props.endTime)
  const [summary, setSummary] = useState(props.summary)
  const [annotationType, setAnnotationType] = useState(props.type)

  const dispatch = useDispatch()
  console.log('here in annotation form; props??', props)

  const isValidAnnotationForm = ({summary, startTime, endTime}): boolean => {
    return isValidAnnotation(annotationType, summary, startTime, endTime)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    props.onSubmit({
      summary,
      startTime,
      endTime,
      type: annotationType,
      id: props.id,
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
    props.onSubmit({summary, startTime, endTime})
  }

  // TODO:  get the correct prefix in there, multiple plot types have annotations now
  const handleDelete = () => {
    const editedAnnotation = {
      summary,
      startTime,
      endTime,
      type: annotationType,
      id: props.id,
      stream: props.stream,
    }

    try {
      dispatch(deleteAnnotations(editedAnnotation))
      event('annotations.delete_annotation.success')
      dispatch(notify(deleteAnnotationSuccess(editedAnnotation.summary)))
      props.onClose()
    } catch (err) {
      event('annotations.delete_annotation.failure')
      dispatch(notify(deleteAnnotationFailed(err)))
    }
  }

  const handleCancel = () => {
    event('dashboards.annotations.create_annotation.cancel')
    props.onClose()
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

  const saveTextSuffix = props.id ? 'Annotation' : 'Changes'

  return (
    <Overlay.Container maxWidth={ANNOTATION_FORM_WIDTH}>
      <Overlay.Header
        title={`${props.title} Annotation`}
        onDismiss={handleCancel}
      />
      <Form onSubmit={handleSubmit}>
        <Overlay.Body>
          <Grid>
            <Grid.Column>
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
                  value="point"
                >
                  Point
                </SelectGroup.Option>
                <SelectGroup.Option
                  onClick={changeToRangeType}
                  value="range"
                  active={'range' === annotationType}
                  id="annotation-form-range-type"
                >
                  Range
                </SelectGroup.Option>
              </SelectGroup>
            </Grid.Column>
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
                time={endTime}
                name="endTime"
                titleText="Stop Time"
              />
            )}

            <AnnotationMessageInput
              message={summary}
              onChange={updateSummary}
              onSubmit={handleKeyboardSubmit}
            />
          </Grid>
        </Overlay.Body>
        <Overlay.Footer>
          {props.id && (
            <Button
              text="Delete Annotation"
              onClick={handleDelete}
              color={ComponentColor.Danger}
              style={{marginRight: '15px'}}
              testID="delete-annotation-button"
            />
          )}
          <>
            <Button
              text="Cancel"
              onClick={handleCancel}
              testID="edit-annotation-cancel-button"
            />
            <Button
              text={`Save ${saveTextSuffix}`}
              color={ComponentColor.Primary}
              type={ButtonType.Submit}
              status={
                isValidAnnotationForm({startTime, endTime, summary})
                  ? ComponentStatus.Default
                  : ComponentStatus.Disabled
              }
              testID="add-annotation-submit"
            />
          </>
        </Overlay.Footer>
      </Form>
    </Overlay.Container>
  )
}
