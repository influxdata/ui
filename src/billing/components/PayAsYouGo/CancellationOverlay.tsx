// Libraries
import React, {FC, useContext, useMemo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  Alert,
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  IconFont,
  Overlay,
} from '@influxdata/clockface'

// Overlays
import ConfirmCancellationOverlay from 'src/billing/components/PayAsYouGo/ConfirmCancellationOverlay'
import {TermsCancellationOverlay} from 'src/billing/components/PayAsYouGo/TermsCancellationOverlay'
import {
  CancelServiceContext,
  CancelationReasons,
} from 'src/billing/components/PayAsYouGo/CancelServiceContext'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {event} from 'src/cloud/utils/reporting'
import {track} from 'rudder-sdk-js'
import {getErrorMessage} from 'src/utils/api'

// APIs
import {postCancel} from 'src/client/unityRoutes'
import {postSignout} from 'src/client'

// Selectors
import {selectCurrentIdentity} from 'src/identity/selectors'

// Notifications
import {accountCancellationError} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

interface Props {
  onHideOverlay: () => void
}

export const CancellationOverlay: FC<Props> = ({onHideOverlay}) => {
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const [hasClickedCancel, setHasClickedCancel] = useState(false)
  const {
    reason,
    canContactForFeedback,
    suggestions,
    shortSuggestion,
    getRedirectLocation,
  } = useContext(CancelServiceContext)

  const dispatch = useDispatch()

  const {user, account, org} = useSelector(selectCurrentIdentity)

  const handleCancelAccount = async () => {
    try {
      event('Cancel account initiated')
      const resp = await postCancel({})

      if (resp.status !== 204) {
        throw new Error(resp.data.message)
      }
      event('Cancel account success')
    } catch (error) {
      const message = getErrorMessage(error)
      event('Cancel account failed', {message})
      dispatch(notify(accountCancellationError(message)))
    }
  }

  const handleCancelService = async () => {
    if (!hasClickedCancel) {
      setHasClickedCancel(true)
      return
    }

    const payload = {
      org: org.id,
      tier: account.type,
      email: user.email,
      alternativeProduct: shortSuggestion,
      suggestions,
      reason: CancelationReasons[reason],
      canContactForFeedback: canContactForFeedback ? 'true' : 'false',
    }
    event('CancelServiceExecuted Event', payload)

    if (isFlagEnabled('rudderstackReporting')) {
      // Send to Rudderstack
      track('CancelServiceExecuted', payload)
    }

    await handleCancelAccount()

    event('Canceled service. Signout initiated')
    postSignout({})
      .then(() => {
        event('Signout success')
        window.location.href = getRedirectLocation()
      })
      .catch(() => event('Cancel service failed', payload))
  }

  const handleDismiss = () => {
    const payload = {
      org: org.id,
      tier: account.type,
      email: user.email,
    }
    event('CancelServiceDismissed Event', payload)

    if (isFlagEnabled('rudderstackReporting')) {
      // Send to Rudderstack
      track('CancelServiceDismissed', payload)
    }

    setHasClickedCancel(false)
    onHideOverlay()
  }

  const isFormValid = useMemo(() => {
    // Has Agreed to Terms & Conditions
    // as well as
    // Selected an option from the Reasons Dropdown
    return (
      hasAgreedToTerms && CancelationReasons[reason] !== CancelationReasons.NONE
    )
  }, [hasAgreedToTerms, reason])

  return (
    <Overlay visible={true} className="cancellation-overlay">
      <Overlay.Container maxWidth={700}>
        <Overlay.Header title="Cancel Service" onDismiss={handleDismiss} />
        <Overlay.Body>
          <Alert
            color={ComponentColor.Danger}
            icon={IconFont.AlertTriangle}
            testID="cancel-overlay--alert"
          >
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
              isFormValid ? ComponentStatus.Default : ComponentStatus.Disabled
            }
            testID="cancel-service-confirmation--button"
          />
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}
