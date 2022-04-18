import React, {FC, ChangeEvent, useContext, useState} from 'react'

// Components
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentStatus,
  Form,
  Overlay,
  TextArea,
} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

interface OwnProps {
  onClose: () => void
}

const FeedbackQuestionsOverlay: FC<OwnProps> = () => {
  const {onClose} = useContext(OverlayContext)
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    // handle form submit
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleValidation = (value: string): string | null => {
    if (value.trim() === '') {
      return 'This field cannot be empty'
    }

    if (value.length >= 2500) {
      return 'Must be 2500 characters or less'
    }
    return null
  }

  const submitButtonStatus = (): ComponentStatus => {
    if (!input.length) {
      return ComponentStatus.Disabled
    }
    return ComponentStatus.Default
  }

  return (
    <Overlay.Container maxWidth={600}>
      <Overlay.Header
        testID="feedback-questions-overlay-header"
        title="Feedback & Questions"
        onDismiss={onClose}
      />
      <ErrorBoundary>
        <Overlay.Body>
          <Form onSubmit={handleSubmit}>
            <Form.ValidationElement
              label="Description"
              required={true}
              value={input}
              validationFunc={handleValidation}
            >
              {status => (
                <TextArea
                  status={status}
                  rows={10}
                  testID="support-description--textarea"
                  name="description"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Describe your feeback (like/dislikes with reasoning, bug you found, what could be improved, etc.) or question (i.e. product pricing) in detail."
                />
              )}
            </Form.ValidationElement>
            <Overlay.Footer>
              <Button
                text="Cancel"
                color={ComponentColor.Tertiary}
                onClick={onClose}
                type={ButtonType.Button}
                testID="payg-contact-support--cancel"
              />
              <Button
                text="Submit"
                color={ComponentColor.Success}
                type={ButtonType.Submit}
                testID="payg-contact-support--submit"
                status={submitButtonStatus()}
              />
            </Overlay.Footer>
          </Form>
        </Overlay.Body>
      </ErrorBoundary>
    </Overlay.Container>
  )
}

export default FeedbackQuestionsOverlay
