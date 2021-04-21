// Libraries
import React, {FC, FormEvent, useState} from 'react'

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
import {ANNOTATION_FORM_WIDTH} from 'src/annotations/constants'

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
    return message.length && startTime
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    props.onSubmit({message, startTime})
  }

  const updateMessage = (newMessage: string): void => {
    setMessage(newMessage)
  }

  const updateStartTime = (newTime: string): void => {
    setStartTime(newTime)
  }

  const handleKeyboardSubmit = () => {
    props.onSubmit({message, startTime})
  }

  return (
    <Overlay.Container maxWidth={ANNOTATION_FORM_WIDTH}>
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
                onSubmit={handleKeyboardSubmit}
                startTime={startTime}
              />
            </Grid.Row>
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
