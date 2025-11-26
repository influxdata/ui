import React, {useContext, FC} from 'react'
import {useDispatch} from 'react-redux'

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
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Design
import './WriteLimitOverlay.scss'

const WriteLimitOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const dispatch = useDispatch()

  const handleContactSupport = () => {
    dispatch(showOverlay('contact-support', null, dismissOverlay))
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
            To request a write limit increase, please{' '}
            <a href="#" onClick={handleContactSupport}>
              contact support
            </a>
            .
          </p>
        </div>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          shape={ButtonShape.Default}
          type={ButtonType.Submit}
          size={ComponentSize.Medium}
          color={ComponentColor.Tertiary}
          text="Close"
          onClick={onClose}
        />
      </Overlay.Footer>
    </OverlayContainer>
  )
}

export default WriteLimitOverlay
