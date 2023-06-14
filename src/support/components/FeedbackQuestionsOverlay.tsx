import React, {FC, ChangeEvent, useContext, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

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
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getMe} from 'src/me/selectors'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface OwnProps {
  onClose: () => void
}

const FeedbackQuestionsOverlay: FC<OwnProps> = () => {
  const [feedbackText, setFeedbackText] = useState('')
  const {onClose} = useContext(OverlayContext)
  const {id: orgID} = useSelector(getOrg)
  const {id: meID} = useSelector(getMe)

  const dispatch = useDispatch()

  const handleSubmit = (evt): void => {
    evt.preventDefault()
    event(
      'helpBar.feedbackAndQuestions.submitted',
      {},
      {userID: meID, orgID: orgID}
    )
    dispatch(
      showOverlay('help-bar-confirmation', {type: 'feedback'}, () =>
        dispatch(dismissOverlay)
      )
    )
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
    <Overlay.Container maxWidth={600} testID="overlay--container">
      <Overlay.Header
        testID="feedback-questions-overlay-header"
        title="Feedback & Questions"
        onDismiss={onClose}
      />
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
                testID="contact-support-description--textarea"
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
            testID="feedback-questions-overlay--cancel"
          />
          <Button
            text="Submit"
            color={ComponentColor.Success}
            type={ButtonType.Submit}
            testID="feedback-questions-overlay--submit"
            status={submitButtonStatus}
          />
        </Overlay.Footer>
      </Form>
    </Overlay.Container>
  )
}

export default FeedbackQuestionsOverlay
