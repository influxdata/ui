import React, {useContext, FC} from 'react'

import {
  OverlayContainer,
  Overlay,
  Heading,
  HeadingElement,
  Button,
  ButtonType,
  ButtonShape,
  ComponentSize,
  ComponentColor,
} from '@influxdata/clockface'

import {OverlayContext} from 'src/overlays/components/OverlayController'

// Reporting
import {event} from 'src/cloud/utils/reporting'

// Design
import './WriteLimitOverlay.scss'

const WriteLimitOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)

  const handleSubmit = (): void => {
    event('limit.requestincrease.writes')

    window.open(`https://support.influxdata.com/s/login`)
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
        <div className="limits-increasewrites--form">
          <Heading element={HeadingElement.H4}>
            Request Query Write Limit Increase
          </Heading>
          <p>
            To request a write limit increase, please contact our support team.
          </p>
        </div>
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
        />
      </Overlay.Footer>
    </OverlayContainer>
  )
}

export default WriteLimitOverlay
