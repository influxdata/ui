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
              <Form.Label label="Type" style={{paddingLeft: 0}} />
              <Grid.Row style={{marginBottom: 8}}>
                <Button
                  onClick={changeToPointType}
                  text="Point"
                  active={'point' === annotationType}
                />

                <Button
                  onClick={changeToRangeType}
                  text="Range"
                  active={'range' === annotationType}
                />
              </Grid.Row>
            </Grid.Column>
            <Grid.Row>
              <AnnotationTimeInput
                onChange={updateStartTime}
                onSubmit={handleKeyboardSubmit}
                time={startTime}
                name="startTime"
              />
            </Grid.Row>
            {annotationType === 'range' && (
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
                message={summary}
                onChange={updateSummary}
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
              isValidAnnotationForm({startTime, endTime, summary})
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
