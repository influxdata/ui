import React, {useState, useContext, FC} from 'react'
import {useSelector} from 'react-redux'

import {
  OverlayContainer,
  Overlay,
  Form,
  Heading,
  Input,
  HeadingElement,
  Button,
  ButtonType,
  ButtonShape,
  ComponentSize,
  ComponentColor,
  ComponentStatus,
  InputType,
} from '@influxdata/clockface'

import {OverlayContext} from 'src/overlays/components/OverlayController'

// Selectors
import {getOrg} from 'src/organizations/selectors'

// Reporting
import {event} from 'src/cloud/utils/reporting'

// Design
import './WriteLimitOverlay.scss'

const WriteLimitOverlay: FC = () => {
  const [limitReason, setLimitReason] = useState('')

  const {onClose} = useContext(OverlayContext)

  const {id} = useSelector(getOrg)

  const handleSubmit = (): void => {
    event('limit.requestincrease.writes', {reason: limitReason})

    window.open(
      `mailto:support@influxdata.com?subject=Request%20Query%20Write%20Limit%20Increase&body=Organization ID%3A%20${id}%0D%0A%0D%0AUse-Case Details:%0D%0A${limitReason}`
    )
  }
  return (
    <OverlayContainer
      maxWidth={760}
      testID="rate-limit-overlay"
      className="rate-limit-overlay"
    >
      <Overlay.Header
        title={`Let's get your data flowing again.`}
        onDismiss={onClose}
        wrapText={true}
      />
      <Overlay.Body className="limits-increasewrites--body">
        <Form onSubmit={handleSubmit} className="limits-increasewrites--form">
          <Heading element={HeadingElement.H4}>
            Request Query Write Limit Increase
          </Heading>
          <Form.Element label="Request Details" required={true}>
            <Input
              name="Write Limit Increase"
              placeholder="Tell us how much you need your write limit raised"
              required={true}
              autoFocus={true}
              value={limitReason}
              onChange={e => setLimitReason(e.target.value)}
              testID="rate-alert-form-amount"
              type={InputType.Text}
            />
          </Form.Element>
        </Form>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          shape={ButtonShape.Default}
          type={ButtonType.Submit}
          size={ComponentSize.Medium}
          color={ComponentColor.Tertiary}
          text="Cancel"
          onClick={onClose}
        />
        <Button
          shape={ButtonShape.Default}
          onClick={handleSubmit}
          size={ComponentSize.Medium}
          color={ComponentColor.Primary}
          className="rate-alert--request-increase-button"
          text="Submit Request"
          status={
            limitReason.length
              ? ComponentStatus.Default
              : ComponentStatus.Disabled
          }
        />
      </Overlay.Footer>
    </OverlayContainer>
  )
}

export default WriteLimitOverlay
