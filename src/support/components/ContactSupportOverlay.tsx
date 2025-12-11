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
} from '@influxdata/clockface'
import {PaidSupportForm} from './PaidSupportForm'
import {FreeSupportMessage} from './FreeSupportMessage'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Selectors
import {
  selectCurrentAccountType,
  selectQuartzIdentity,
} from 'src/identity/selectors'
import {isOrgIOx} from 'src/organizations/selectors'

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

export const ContactSupportOverlay: FC<OwnProps> = () => {
  const quartzIdentity = useSelector(selectQuartzIdentity)
  const {user: identityUser, org: identityOrg} = quartzIdentity.currentIdentity
  const accountType = useSelector(selectCurrentAccountType)
  const isIOxOrg = useSelector(isOrgIOx)
  const {onClose, params} = useContext(OverlayContext)

  const prefilledSubject = params?.subject || ''
  const prefilledDescription = params?.description || ''

  const [subject, setSubject] = useState(prefilledSubject)
  const [severity, setSeverity] = useState('3 - Standard')
  const [description, setDescription] = useState(prefilledDescription)

  const dispatch = useDispatch()

  const isContractOrPAYG =
    accountType === 'contract' || accountType === 'pay_as_you_go'

  const submitButtonStatus =
    description.length && severity.length && subject.length
      ? ComponentStatus.Default
      : ComponentStatus.Disabled

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value)
  }

  const handleClose = () => {
    event('helpBar.contactSupportRequest.overlay.closed')
    onClose()
  }

  const handleSubmit = async () => {
    const userID = identityUser.id
    const userEmail = identityUser.email
    const orgName = identityOrg.name
    const orgID = identityOrg.id

    const translatedSeverity = translateSeverityLevelForSfdc(severity)
    const caseOrigin = 'Cloud App'
    const deploymentType = isIOxOrg
      ? 'InfluxDB Cloud Serverless'
      : 'InfluxCloud2.0'

    try {
      await createSfdcSupportCase(
        description,
        userEmail,
        translatedSeverity,
        subject,
        caseOrigin,
        deploymentType
      )
      event(
        'helpBar.contactSupportRequest.submitted',
        {},
        {userID, orgName, orgID}
      )
      dispatch(
        showOverlay('help-bar-confirmation', {type: 'contract'}, () =>
          dispatch(dismissOverlay)
        )
      )
    } catch {
      dispatch(notify(supportRequestError()))
      event('helpBar.contactSupportRequest.failed', {}, {userID, orgID})
    }
  }

  const handleSubjectChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSubject(event.target.value)
  }

  const handleChangeSeverity = (severity: string): void => {
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

  return (
    <Overlay.Container maxWidth={550}>
      <Overlay.Header
        testID="contact-support-overlay-header"
        title="Contact Support"
        onDismiss={handleClose}
      />
      <Form>
        <Overlay.Body>
          {isContractOrPAYG ? (
            <PaidSupportForm
              subject={subject}
              severity={severity}
              description={description}
              onSubjectChange={handleSubjectChange}
              onSeverityChange={handleChangeSeverity}
              onDescriptionChange={handleDescriptionChange}
              onValidation={handleValidation}
            />
          ) : (
            <FreeSupportMessage />
          )}
        </Overlay.Body>
      </Form>
      <Overlay.Footer>
        <Button
          text="Cancel"
          color={ComponentColor.Tertiary}
          onClick={handleClose}
          type={ButtonType.Button}
          testID="contact-support--cancel"
        />
        {isContractOrPAYG && (
          <Button
            text="Submit"
            color={ComponentColor.Success}
            type={ButtonType.Submit}
            testID="contact-support--submit"
            status={submitButtonStatus}
            onClick={handleSubmit}
          />
        )}
      </Overlay.Footer>
    </Overlay.Container>
  )
}
