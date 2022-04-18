import React, {FC, ChangeEvent, useContext, useState} from 'react'

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
  Method,
  Overlay,
  QuestionMarkTooltip,
  SelectDropdown,
  TextArea,
} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

import './ContactSupport.scss'
interface OwnProps {
  onClose: () => void
}

const PayGSupportOverlay: FC<OwnProps> = () => {
  const [severity, setSeverity] = useState('')
  const [input, setInput] = useState('')
  const {onClose} = useContext(OverlayContext)

  const severityLevel = [
    '1 - Critical',
    '2 - High',
    '3 - Standard',
    '4 - Request',
  ]

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }
  const handleSubmit = (): void => {
    // submit support form
  }

  const handleChangeSeverity = (severity): void => {
    setSeverity(severity)
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
    if (!input.length || !severity) {
      return ComponentStatus.Disabled
    }
    return ComponentStatus.Default
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
        style={{marginLeft: '420px'}}
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
      <ErrorBoundary>
        <Overlay.Body>
          <Form
            onSubmit={handleSubmit}
            action="https://influxdata--full.my.salesforce.com/servlet/servlet.WebToCase?encoding=UTF-8"
            method={Method.Post}
          >
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

export default PayGSupportOverlay
