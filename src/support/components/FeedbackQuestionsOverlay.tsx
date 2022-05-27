import React, {FC, ChangeEvent, useContext, useState} from 'react'
import {connect, useSelector} from 'react-redux'

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

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getMe} from 'src/me/selectors'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface OwnProps {
  onClose: () => void
}
interface DispatchProps {
  showOverlay: (arg1: string, arg2: any, any) => {}
}
type Props = OwnProps & DispatchProps

const FeedbackQuestionsOverlay: FC<Props> = props => {
  const {onClose} = useContext(OverlayContext)
  const {id: orgID} = useSelector(getOrg)
  const {id: meID} = useSelector(getMe)
  const [feedbackText, setFeedbackText] = useState('')

  const handleSubmit = (e): void => {
    const {showOverlay} = props
    e.preventDefault()
    event(
      'helpBar.feedbackAndQuestions.submitted',
      {},
      {userID: meID, orgID: orgID}
    )
    showOverlay('help-bar-confirmation', {type: 'feedback'}, dismissOverlay)
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFeedbackText(e.target.value)
  }

  const handleValidation = (value: string): string | null => {
    if (value.trim() === '') {
      return 'This field cannot be empty'
    }

    if (value.length >= 2500) {
      return 'Must be 2500 characters or fewer'
    }
    return null
  }

  const submitButtonStatus = feedbackText.length
    ? ComponentStatus.Default
    : ComponentStatus.Disabled

  return (
    <Overlay.Container maxWidth={600}>
      <Overlay.Header
        testID="feedback-questions-overlay-header"
        title="Feedback & Questions"
        onDismiss={onClose}
      />
      <ErrorBoundary>
        <Form onSubmit={handleSubmit}>
          <Overlay.Body>
            <Form.ValidationElement
              label="Description"
              required={true}
              value={feedbackText}
              validationFunc={handleValidation}
            >
              {status => (
                <TextArea
                  status={status}
                  rows={10}
                  testID="support-description--textarea"
                  name="description"
                  value={feedbackText}
                  onChange={handleInputChange}
                  placeholder="Describe your feeback (like/dislikes with reasoning, bug you found, what could be improved, etc.) or question (e.g. product pricing) in detail."
                />
              )}
            </Form.ValidationElement>
          </Overlay.Body>
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
              status={submitButtonStatus}
            />
          </Overlay.Footer>
        </Form>
      </ErrorBoundary>
    </Overlay.Container>
  )
}

const mdtp = {
  showOverlay,
  dismissOverlay,
}

const connector = connect(null, mdtp)

export default connector(FeedbackQuestionsOverlay)
