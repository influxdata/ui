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
import {getMe, getQuartzMe} from 'src/me/selectors'

// Utils
import {event} from 'src/cloud/utils/reporting'

// API
import {createSfdcSupportCase} from 'src/shared/apis/sfdc'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {supportRequestError} from 'src/shared/copy/notifications/categories/help-and-support'

import './ContactSupport.scss'

const translateSeverityLevelForSfdc = (severity: string): string => {
  switch (severity) {
    case '1 - Critical': {
      return 'Severity 1'
    }
    case '2 - High': {
      return 'Severity 2'
    }
    case '3 - Standard': {
      return 'Severity 3'
    }
    case '4 - Request': {
      return 'Severity 4'
    }
  }
}

interface OwnProps {
  onClose: () => void
}

const PayGSupportOverlay: FC<OwnProps> = () => {
  const {id: orgID} = useSelector(getOrg)
  const quartzMe = useSelector(getQuartzMe)
  const me = useSelector(getMe)

  const [subject, setSubject] = useState('')
  const [severity, setSeverity] = useState('3 - Standard')
  const [description, setDescription] = useState('')
  const {onClose} = useContext(OverlayContext)

  const dispatch = useDispatch()

  const severityLevel = [
    '1 - Critical',
    '2 - High',
    '3 - Standard',
    '4 - Request',
  ]

  const submitButtonStatus =
    description.length && severity.length && subject.length
      ? ComponentStatus.Default
      : ComponentStatus.Disabled

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value)
  }

  const handleClose = () => {
    event('helpBar.paygSupportRequest.overlay.closed')
    onClose()
  }

  const handleSubmit = async () => {
    const email = quartzMe?.email
    const descriptionWithOrgId = `${description}  [Org Id: ${orgID}]`
    const translatedSeverity = translateSeverityLevelForSfdc(severity)
    try {
      await createSfdcSupportCase(
        descriptionWithOrgId,
        email,
        translatedSeverity,
        subject
      )
      event(
        'helpBar.paygSupportRequest.submitted',
        {},
        {userID: me.id, orgID: orgID}
      )
      dispatch(
        showOverlay('help-bar-confirmation', {type: 'PAYG'}, () =>
          dispatch(dismissOverlay)
        )
      )
    } catch {
      dispatch(notify(supportRequestError()))
      event(
        'helpBar.paygSupportRequest.failed',
        {},
        {userID: me.id, orgID: orgID}
      )
    }
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
        onDismiss={handleClose}
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
              value={description}
              validationFunc={handleValidation}
            >
              {status => (
                <TextArea
                  status={status}
                  rows={10}
                  testID="support-description--textarea"
                  name="description"
                  value={description}
                  onChange={handleDescriptionChange}
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
          onClick={handleClose}
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
