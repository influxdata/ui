// Libraries
import React, {ChangeEvent, FC, FormEvent, useContext, useReducer} from 'react'

// Components
import {
  Overlay,
  Button,
  ComponentColor,
  Form,
  Grid,
  Columns,
  InputRef,
  TextAreaRef,
  ButtonType,
} from '@influxdata/clockface'
import AnnotationSummaryInput from 'src/annotations/components/annotationForm/AnnotationSummaryInput'
import AnnotationTimeStartInput from 'src/annotations/components/annotationForm/AnnotationTimeStartInput'
import AnnotationTimeStopInput from 'src/annotations/components/annotationForm/AnnotationTimeStopInput'
import AnnotationMessageInput from 'src/annotations/components/annotationForm/AnnotationMessageInput'
import AnnotationTypeToggle from 'src/annotations/components/annotationForm/AnnotationTypeToggle'
import AnnotationStreamSelector from 'src/annotations/components/annotationForm/AnnotationStreamSelector'

// Form State
import {
  annotationReducer,
  getInitialAnnotationState,
  AnnotationType,
  annotationFormIsValid,
  Annotation,
  getAnnotationFromDraft,
} from 'src/annotations/reducers/annotationReducer'

// Types
import {AnnotationStream} from 'src/annotations/constants/mocks'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

interface Props {
  title: 'Edit' | 'Add'
  type: AnnotationType
  timeStart: string
  timeStop: string
  summaryText?: string
  messageText?: string
  streamID?: string
  onSubmit: (Annotation: Annotation) => void
}

const AnnotationForm: FC<Props> = ({
  title,
  type,
  timeStart,
  timeStop,
  summaryText,
  messageText,
  streamID,
  onSubmit,
}) => {
  const initialAnnotationState = getInitialAnnotationState(
    type,
    timeStart,
    timeStop,
    summaryText,
    messageText,
    streamID
  )

  const [state, dispatch] = useReducer(
    annotationReducer,
    initialAnnotationState
  )

  const {onClose} = useContext(OverlayContext)

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const formIsValid = annotationFormIsValid(state, dispatch)

    if (formIsValid) {
      onSubmit(getAnnotationFromDraft(state))
      onClose()
    }
  }

  const handleSummaryChange = (e: ChangeEvent<InputRef>): void => {
    dispatch({type: 'updateSummary', payload: e.target.value})
  }

  const handleTypeChange = (payload: AnnotationType): void => {
    dispatch({type: 'updateType', payload})
  }

  const handleTimeStartChange = (e: ChangeEvent<InputRef>): void => {
    dispatch({type: 'updateTimeStart', payload: e.target.value})
  }

  const handleTimeStopChange = (e: ChangeEvent<InputRef>): void => {
    dispatch({type: 'updateTimeStop', payload: e.target.value})
  }

  const handleMessageChange = (e: ChangeEvent<TextAreaRef>): void => {
    dispatch({type: 'updateMessage', payload: e.target.value})
  }

  const handleStreamChange = (payload: AnnotationStream): void => {
    dispatch({type: 'updateStream', payload})
  }

  return (
    <Overlay.Container maxWidth={560}>
      <Overlay.Header title={`${title} Annotation`} onDismiss={onClose} />
      <Form onSubmit={handleSubmit}>
        <Overlay.Body>
          <Grid>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Seven}>
                <AnnotationSummaryInput
                  {...state.summary}
                  onChange={handleSummaryChange}
                />
              </Grid.Column>
              <Grid.Column widthXS={Columns.Five}>
                <AnnotationTypeToggle
                  type={state.type}
                  onChange={handleTypeChange}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column
                widthXS={state.type === 'range' ? Columns.Six : Columns.Twelve}
              >
                <AnnotationTimeStartInput
                  {...state.timeStart}
                  type={state.type}
                  onChange={handleTimeStartChange}
                />
              </Grid.Column>
              {state.type === 'range' && (
                <Grid.Column widthXS={Columns.Six}>
                  <AnnotationTimeStopInput
                    {...state.timeStop}
                    onChange={handleTimeStopChange}
                  />
                </Grid.Column>
              )}
            </Grid.Row>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Twelve}>
                <AnnotationMessageInput
                  {...state.message}
                  onChange={handleMessageChange}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Twelve}>
                <AnnotationStreamSelector
                  error={state.streamIDError}
                  streamID={state.streamID}
                  onChange={handleStreamChange}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Overlay.Body>
        <Overlay.Footer>
          <Button text="Cancel" onClick={onClose} />
          <Button
            text="Add Annotation"
            color={ComponentColor.Primary}
            type={ButtonType.Submit}
          />
        </Overlay.Footer>
      </Form>
    </Overlay.Container>
  )
}

export default AnnotationForm
