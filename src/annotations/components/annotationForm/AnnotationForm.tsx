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

// Actions
import {updateAnnotationDraft} from 'src/annotations/actions/annotationFormActions'

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

  const handleInputChange = (e: ChangeEvent<any>): void => {
    const data = {}
    data[`${e.target.name}`] = e.target.value
    dispatch(updateAnnotationDraft(data))
  }

  const handleTypeChange = (type: AnnotationType): void => {
    dispatch(updateAnnotationDraft({type}))
  }

  const handleStreamChange = (stream: AnnotationStream): void => {
    dispatch(
      updateAnnotationDraft({
        streamID: stream.id,
        ...stream.query,
      })
    )
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
                  value={state.summary}
                  error={state.summaryError}
                  status={state.summaryStatus}
                  onChange={handleInputChange}
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
                  value={state.timeStart}
                  error={state.timeStartError}
                  status={state.timeStartStatus}
                  type={state.type}
                  onChange={handleInputChange}
                />
              </Grid.Column>
              {state.type === 'range' && (
                <Grid.Column widthXS={Columns.Six}>
                  <AnnotationTimeStopInput
                    value={state.timeStop}
                    error={state.timeStopError}
                    status={state.timeStopStatus}
                    onChange={handleInputChange}
                  />
                </Grid.Column>
              )}
            </Grid.Row>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Twelve}>
                <AnnotationMessageInput
                  value={state.message}
                  onChange={handleInputChange}
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
