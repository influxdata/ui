// Libraries
import React, {FC, useContext, useState} from 'react'
import {
  Overlay,
  Alert,
  ComponentColor,
  ComponentSize,
  IconFont,
  Button,
  ComponentStatus,
} from '@influxdata/clockface'

// Components
import TermsCancellationOverlay from 'src/billing/components/PayAsYouGo/TermsCancellationOverlay'
import ConfirmCancellationOverlay from 'src/billing/components/PayAsYouGo/ConfirmCancellationOverlay'
import {BillingContext} from 'src/billing/context/billing'

interface Props {
  isOverlayVisible: boolean
  onHideOverlay: () => void
}

const CancellationOverlay: FC<Props> = ({isOverlayVisible, onHideOverlay}) => {
  const {handleCancelAccount} = useContext(BillingContext)
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const [hasClickedCancel, setHasClickedCancel] = useState(false)

  const handleCancelService = () => {
    if (!hasClickedCancel) {
      setHasClickedCancel(true)
    } else {
      handleCancelAccount()
    }
  }

  return (
    <Overlay visible={isOverlayVisible} className="cancellation-overlay">
      <Overlay.Container maxWidth={600}>
        <Overlay.Header title="Cancel Service" onDismiss={onHideOverlay} />
        <Overlay.Body>
          <Alert color={ComponentColor.Danger} icon={IconFont.AlertTriangle}>
            This action cannot be undone
          </Alert>
          {hasClickedCancel ? (
            <ConfirmCancellationOverlay />
          ) : (
            <TermsCancellationOverlay
              hasAgreedToTerms={hasAgreedToTerms}
              onAgreedToTerms={() => setHasAgreedToTerms(prev => !prev)}
            />
          )}
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            color={ComponentColor.Danger}
            onClick={handleCancelService}
            text={
              hasClickedCancel === false
                ? 'I understand, Cancel Service'
                : 'Confirm and Cancel Service'
            }
            size={ComponentSize.Small}
            status={
              hasAgreedToTerms
                ? ComponentStatus.Default
                : ComponentStatus.Disabled
            }
          />
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}

export default CancellationOverlay
