// Libraries
import React, {FC, useContext, useMemo, useState} from 'react'
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
import CancellationTerms from './CancellationTerms'
import {
  CancelServiceContext,
  VariableItems,
} from 'src/billing/components/PayAsYouGo/CancelServiceContext'
import {track} from 'rudder-sdk-js'
import {event} from 'src/cloud/utils/reporting'
import {useSelector} from 'react-redux'
import {getQuartzMe} from 'src/me/selectors'
import {getOrg} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {postSignout} from 'src/client'
import {UserAccountContext} from './context/userAccount'

interface Props {
  onHideOverlay: () => void
}

const CancellationOverlay: FC<Props> = ({onHideOverlay}) => {
  const {handleCancelAccount} = useContext(UserAccountContext)
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const [hasClickedCancel, setHasClickedCancel] = useState(false)
  const {
    reason,
    canContactForFeedback,
    suggestions,
    shortSuggestion,
    getRedirectLocation,
  } = useContext(CancelServiceContext)
  const quartzMe = useSelector(getQuartzMe)
  const org = useSelector(getOrg)

  const handleCancelService = () => {
    if (!hasClickedCancel) {
      setHasClickedCancel(true)
    }

    const payload = {
      org: org.id,
      tier: quartzMe?.accountType,
      email: quartzMe?.email,
      alternativeProduct: shortSuggestion,
      suggestions,
      reason: VariableItems[reason],
      canContactForFeedback: canContactForFeedback ? 'true' : 'false',
    }
    event('CancelServiceExecuted Event', payload)

    if (
      isFlagEnabled('rudderstackReporting') &&
      isFlagEnabled('trackCancellations')
    ) {
      // Send to Rudderstack
      track('CancelServiceExecuted', payload)
    }

    handleCancelAccount()

    if (isFlagEnabled('trackCancellations')) {
      postSignout({}).then(() => {
        window.location.href = getRedirectLocation()
      })
    }

    event('Cancel Service Executed', payload)
  }

  const handleDismiss = () => {
    const payload = {
      org: org.id,
      tier: quartzMe?.accountType,
      email: quartzMe?.email,
    }
    event('CancelServiceDismissed Event', payload)

    if (
      isFlagEnabled('rudderstackReporting') &&
      isFlagEnabled('trackCancellations')
    ) {
      // Send to Rudderstack
      track('CancelServiceDismissed', payload)
    }

    setHasClickedCancel(false)
    onHideOverlay()
  }

  const isFormValid = useMemo(() => {
    if (!isFlagEnabled('trackCancellations')) {
      return hasAgreedToTerms
    }

    // Has Agreed to Terms & Conditions
    // as well as
    // Selected an option from the Reasons Dropdown
    return hasAgreedToTerms && VariableItems[reason] !== VariableItems.NO_OPTION
  }, [hasAgreedToTerms, reason])

  return (
    <Overlay visible={true} className="cancellation-overlay">
      <Overlay.Container maxWidth={700}>
        <Overlay.Header title="Deactivate Account" onDismiss={handleDismiss} />
        <Overlay.Body>
          <Alert
            color={ComponentColor.Danger}
            icon={IconFont.AlertTriangle}
            testID="cancel-overlay--alert"
          >
            This action cannot be undone
          </Alert>
          <CancellationTerms
            hasAgreedToTerms={hasAgreedToTerms}
            onAgreedToTerms={() => setHasAgreedToTerms(prev => !prev)}
          />
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            color={ComponentColor.Danger}
            onClick={handleCancelService}
            text="Deactivate Account"
            size={ComponentSize.Small}
            status={
              isFormValid ? ComponentStatus.Default : ComponentStatus.Disabled
            }
            testID="cancel-service-confirmation--button"
          />
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}

export default CancellationOverlay
