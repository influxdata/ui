import React, {FC, ChangeEvent, useContext, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentStatus,
  DropdownItemType,
  Form,
  Icon,
  IconFont,
  Input,
  Overlay,
  QuestionMarkTooltip,
  SelectDropdown,
  TextArea,
} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

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

import './ContactSupport.scss'
interface OwnProps {
  onClose: () => void
}

const PayGSupportOverlay: FC<OwnProps> = () => {
  const {id: orgID} = useSelector(getOrg)
  const {id: meID} = useSelector(getMe)
  const [subject, setSubject] = useState('')
  const [severity, setSeverity] = useState('')
  const [textInput, setTextInput] = useState('')
  const {onClose} = useContext(OverlayContext)

  const dispatch = useDispatch()

  const severityLevel = [
    '1 - Critical',
    '2 - High',
    '3 - Standard',
    '4 - Request',
  ]

  const submitButtonStatus =
    textInput.length && severity.length && subject.length
      ? ComponentStatus.Default
      : ComponentStatus.Disabled

  const handleSubmit = (evt): void => {
    evt.preventDefault()
    event('helpBar.supportRequest.submitted', {}, {userID: meID, orgID: orgID})
    dispatch(showOverlay('help-bar-confirmation', {type: 'PAYG'}, () => dispatch(dismissOverlay)))
  }

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value)
  }

  const handleSubjectChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSubject(event.target.value)
  }

  const handleChangeSeverity = (severity): void => {
    setSeverity(severity)
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

  const severityTip = (): JSX.Element => {
    const tooltipContent = (
      <div>
        Please refer to our severity levels in our
        <SafeBlankLink href="https://www.influxdata.com/legal/support-policy">
          {' '}
          support policy{' '}
        </SafeBlankLink>
        website
      </div>
    )
    return (
      <QuestionMarkTooltip
        diameter={14}
        tooltipContents={tooltipContent}
        tooltipStyle={{fontSize: '13px'}}
      />
    )
  }

  return (
    <Overlay.Container maxWidth={550}>
      <Overlay.Header
        testID="payg-support-overlay-header"
        title="Contact Support"
        onDismiss={onClose}
      />
      <ErrorBoundary>
        <Form>
          <Overlay.Body>
            <p className="status-page-text">
              <span>
                {' '}
                <Icon glyph={IconFont.Info_New} />{' '}
              </span>
              Check our{' '}
              <SafeBlankLink href="https://status.influxdata.com">
                status page
              </SafeBlankLink>{' '}
              to see if there is an outage impacting your region.
            </p>
            <Form.Element label="Subject" required={true}>
              <Input
                name="subject"
                value={subject}
                onChange={handleSubjectChange}
                testID="contact-support-subject-input"
              />
            </Form.Element>
            <Form.Element
              label="Severity"
              required={true}
              labelAddOn={severityTip}
            >
              <SelectDropdown
                options={severityLevel}
                selectedOption={severity}
                onSelect={handleChangeSeverity}
                indicator={DropdownItemType.None}
              />
            </Form.Element>
            <Form.ValidationElement
              label="Description"
              required={true}
              value={textInput}
              validationFunc={handleValidation}
            >
              {status => (
                <TextArea
                  status={status}
                  rows={10}
                  testID="support-description--textarea"
                  name="description"
                  value={textInput}
                  onChange={handleInputChange}
                />
              )}
            </Form.ValidationElement>
          </Overlay.Body>
        </Form>
      </ErrorBoundary>
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
          onClick={handleSubmit}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default PayGSupportOverlay
