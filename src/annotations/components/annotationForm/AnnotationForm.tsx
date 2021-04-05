// Libraries
import React, {FC, ChangeEvent, FormEvent, useState} from 'react'

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
import {AnnotationStartTimeInput} from 'src/annotations/components/annotationForm/AnnotationStartTimeInput'

// Constants
import {MAX_ANNOTATIONS_MESSAGE_LENGTH} from 'src/shared/constants'

interface Annotation {
  message: string
  startTime: number | string
}

type AnnotationType = 'point' | 'range'

interface Props {
  startTime: string
  title: 'Edit' | 'Add'
  type: AnnotationType
  onSubmit: (Annotation) => void
  onClose: () => void
}

export const AnnotationForm: FC<Props> = (props: Props) => {
  const [startTime, setStartTime] = useState(props.startTime)
  const [message, setMessage] = useState('')

  const isValidAnnotationForm = ({message, startTime}): boolean => {
    return message.length <= MAX_ANNOTATIONS_MESSAGE_LENGTH && startTime
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    props.onSubmit({message, startTime})
  }

  const updateMessage = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(event.target.value)
  }

  const updateStartTime = (event: ChangeEvent<HTMLInputElement>): void => {
    setStartTime(event.target.value)
  }

  return (
    <Overlay.Container maxWidth={560}>
      <Overlay.Header
        title={`${props.title} Annotation`}
        onDismiss={props.onClose}
      />
      <Form onSubmit={handleSubmit}>
        <Overlay.Body>
          <Grid>
            <Grid.Row>
              <AnnotationStartTimeInput
                onChange={updateStartTime}
                startTime={startTime}
              />
            </Grid.Row>
            <Grid.Row>
              <AnnotationMessageInput
                message={message}
                onChange={updateMessage}
              />
            </Grid.Row>
          </Grid>
        </Overlay.Body>
        <Overlay.Footer>
          <Button text="Cancel" onClick={props.onClose} />
          <Button
            text="Save Annotation"
            color={ComponentColor.Primary}
            type={ButtonType.Submit}
            status={
              isValidAnnotationForm({startTime, message})
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
