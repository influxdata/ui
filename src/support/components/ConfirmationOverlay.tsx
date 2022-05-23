import React, {FC, useContext} from 'react'

// Components
import {Button, ButtonType, ComponentColor, Overlay} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

interface OwnProps {
  onClose: () => void
}

const ConfirmationOverlay: FC<OwnProps> = () => {
  const {onClose, params} = useContext(OverlayContext)

  const feedbackAndQuestions = (
    <p>
    Thank you for your submission! Please keep a lookout in your account email for confirmation and follow-up.
  </p>
  )

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        testID="confirmation-overlay-header"
        title= {params === 'payg' ? "Contact Support": "Feedback & Questions"}
        onDismiss={onClose}
      />
      <Overlay.Body>
          {params === 'payg' ? 
          <>
        <p>
          Your support ticket has been submitted. A Support Engineer will investigate the issue and get back to you shortly.
          Please check your account email for a confirmation and follow-up.
        </p>
        <p>
          For more resources, check out <SafeBlankLink href="https://support.influxdata.com"> support.influxdata.com </SafeBlankLink>
        </p>
        </>
      : feedbackAndQuestions}
      </Overlay.Body>
      <Overlay.Footer>
      <Button
        text="OK"
        color={ComponentColor.Success}
        onClick={onClose}
        type={ButtonType.Button}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default ConfirmationOverlay
