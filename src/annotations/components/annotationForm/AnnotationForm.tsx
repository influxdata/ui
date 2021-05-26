// Libraries
import React, {FC, FormEvent, useState} from 'react'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Components
import {
  Overlay,
  Button,
  ComponentColor,
  Form,
  Grid,
  ButtonType,
  ComponentStatus,
} from '@influxdata/clockface'
import {AnnotationMessageInput} from 'src/annotations/components/annotationForm/AnnotationMessageInput'
import {AnnotationTimeInput} from 'src/annotations/components/annotationForm/AnnotationTimeInput'

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
  type: AnnotationType
  onSubmit: (Annotation) => void
  onClose: () => void
}

export const isValidAnnotation = (
  annotationType: string,
  message: string,
  startTime: any,
  endTime: any
) => {
  const isValidPointAnnotation = message.length && startTime

  // not checking if start <= end right now
  // initially, the times are numbers, and then if the user manually edits them then
  // they are strings, so the simple compare is non-trivial.
  // plus, the backend checks if the startTime is before or equals the endTime
  // so, letting the backend do that check for now.
  if (annotationType === 'range') {
    return isValidPointAnnotation && endTime
  }
  return isValidPointAnnotation
}

export const AnnotationForm: FC<Props> = (props: Props) => {
  const [startTime, setStartTime] = useState(props.startTime)
  const [endTime, setEndTime] = useState(props.endTime)
  const [message, setMessage] = useState('')

  const isValidAnnotationForm = ({message, startTime, endTime}): boolean => {
    return isValidAnnotation(props.type, message, startTime, endTime)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    props.onSubmit({message, startTime, endTime})
  }

  const updateMessage = (newMessage: string): void => {
    setMessage(newMessage)
  }

  const updateStartTime = (newTime: string): void => {
    setStartTime(newTime)
  }

  const updateEndTime = (newTime: string): void => {
    setEndTime(newTime)
  }

  const handleKeyboardSubmit = () => {
    props.onSubmit({message, startTime, endTime})
  }

  const handleCancel = () => {
    event('dashboards.annotations.create_annotation.cancel')
    props.onClose()
  }

  return (
    <Overlay.Container maxWidth={ANNOTATION_FORM_WIDTH}>
      <Overlay.Header
        title={`${props.title} Annotation`}
        onDismiss={handleCancel}
      />
      <Form onSubmit={handleSubmit}>
        <Overlay.Body>
          <Grid>
            <Grid.Row>
              <AnnotationTimeInput
                onChange={updateStartTime}
                onSubmit={handleKeyboardSubmit}
                time={startTime}
                name="startTime"
              />
            </Grid.Row>
            {props.type === 'range' && (
              <Grid.Row>
                <AnnotationTimeInput
                  onChange={updateEndTime}
                  onSubmit={handleKeyboardSubmit}
                  time={endTime}
                  name="endTime"
                  titleText="Stop Time"
                />
              </Grid.Row>
            )}
            <Grid.Row>
              <AnnotationMessageInput
                message={message}
                onChange={updateMessage}
                onSubmit={handleKeyboardSubmit}
              />
            </Grid.Row>
          </Grid>
        </Overlay.Body>
        <Overlay.Footer>
          <Button text="Cancel" onClick={handleCancel} />
          <Button
            text="Save Annotation"
            color={ComponentColor.Primary}
            type={ButtonType.Submit}
            status={
              isValidAnnotationForm({startTime, endTime, message})
                ? ComponentStatus.Default
                : ComponentStatus.Disabled
            }
            testID="add-annotation-submit"
          />
        </Overlay.Footer>
      </Form>
    </Overlay.Container>
  )
}
