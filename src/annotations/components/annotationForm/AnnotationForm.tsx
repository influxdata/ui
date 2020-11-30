// Libraries
import React, {
  FC,
  FormEvent,
  useContext,
  useReducer,
  createContext,
} from 'react'

// Components
import {
  Overlay,
  Button,
  ComponentColor,
  Form,
  Grid,
  ButtonType,
} from '@influxdata/clockface'
import {AnnotationSummaryInput} from 'src/annotations/components/annotationForm/AnnotationSummaryInput'
import {AnnotationTimeStartInput} from 'src/annotations/components/annotationForm/AnnotationTimeStartInput'
import {AnnotationTimeStopInput} from 'src/annotations/components/annotationForm/AnnotationTimeStopInput'
import {AnnotationMessageInput} from 'src/annotations/components/annotationForm/AnnotationMessageInput'
import {AnnotationTypeToggle} from 'src/annotations/components/annotationForm/AnnotationTypeToggle'
import {AnnotationStreamSelector} from 'src/annotations/components/annotationForm/AnnotationStreamSelector'

// Form State
import {
  annotationFormReducer,
  getInitialAnnotationState,
  AnnotationType,
  Annotation,
  getAnnotationFromDraft,
  AnnotationContextType,
  DEFAULT_ANNOTATION_CONTEXT,
} from 'src/annotations/reducers/annotationFormReducer'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

import {updateAnnotationDraft} from 'src/annotations/actions/annotationFormActions'

import {annotationFormIsValid} from 'src/annotations/utils/form'

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

export const AnnotationFormContext = createContext<AnnotationContextType>(
  DEFAULT_ANNOTATION_CONTEXT
)

export const AnnotationForm: FC<Props> = ({
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
    annotationFormReducer,
    initialAnnotationState
  )

  const {onClose} = useContext(OverlayContext)

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    // force required inputs into error or valid state (instead of initial)
    // so user can resolve the form errors and submit again
    dispatch(updateAnnotationDraft(state))
    const formIsValid = annotationFormIsValid(state)

    if (formIsValid) {
      onSubmit(getAnnotationFromDraft(state))
      onClose()
    }
  }

  return (
    <AnnotationFormContext.Provider value={{...state, dispatch}}>
      <Overlay.Container maxWidth={560}>
        <Overlay.Header title={`${title} Annotation`} onDismiss={onClose} />
        <Form onSubmit={handleSubmit}>
          <Overlay.Body>
            <Grid>
              <Grid.Row>
                <AnnotationSummaryInput />
                <AnnotationTypeToggle />
              </Grid.Row>
              <Grid.Row>
                <AnnotationTimeStartInput />
                <AnnotationTimeStopInput />
              </Grid.Row>
              <Grid.Row>
                <AnnotationMessageInput />
              </Grid.Row>
              <Grid.Row>
                <AnnotationStreamSelector />
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
    </AnnotationFormContext.Provider>
  )
}
