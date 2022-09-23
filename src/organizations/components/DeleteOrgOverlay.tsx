// Libraries
import React, {FC, useContext, useMemo, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {
  Alert,
  AlignItems,
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  IconFont,
  Input,
  InputLabel,
  InputType,
  JustifyContent,
  Overlay,
} from '@influxdata/clockface'
import {track} from 'rudder-sdk-js'

// Utils
import {deleteAccount} from 'src/client/unityRoutes'
import {notify} from 'src/shared/actions/notifications'
import {accountSelfDeletionFailed} from 'src/shared/copy/notifications'
import DeleteOrgReasonsForm from 'src/organizations/components/DeleteOrgReasonsForm'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {event} from 'src/cloud/utils/reporting'

// Selectors
import {
  DeleteOrgContext,
  VariableItems,
} from 'src/organizations/components/DeleteOrgContext'
import {getOrg} from 'src/organizations/selectors'
import {selectCurrentIdentity} from 'src/identity/selectors'

const DeleteOrgOverlay: FC = () => {
  const history = useHistory()
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const dispatch = useDispatch()
  const {reason, shortSuggestion, suggestions, getRedirectLocation} =
    useContext(DeleteOrgContext)
  const currentIdentity = useSelector(selectCurrentIdentity)
  const {user, account} = currentIdentity
  const org = useSelector(getOrg)

  const handleClose = () => {
    const payload = {
      org: org.id,
      tier: account.type,
      email: user.email,
    }
    event('DeleteOrgDismissed Event', payload)

    if (isFlagEnabled('rudderstackReporting')) {
      // Send to Rudderstack
      track('DeleteOrgDismissed', payload)
    }

    history.goBack()
  }

  const isFormValid = useMemo(() => {
    // Has Agreed to Terms & Conditions
    // as well as
    // Selected an option from the Reasons Dropdown
    return hasAgreedToTerms && VariableItems[reason] !== VariableItems.NO_OPTION
  }, [hasAgreedToTerms, reason])

  const handleDeleteAccount = async () => {
    const payload = {
      org: org.id,
      tier: account.type,
      email: user.email,
      alternativeProduct: shortSuggestion,
      suggestions,
      reason: VariableItems[reason],
    }
    event('DeleteOrgExecuted Event', payload)

    if (isFlagEnabled('rudderstackReporting')) {
      track('DeleteOrgExecuted', payload)
    }

    try {
      const resp = await deleteAccount({})
      event('Delete Org Executed', payload)

      if (resp.status !== 204) {
        throw new Error(resp.data.message)
      }

      window.location.href = getRedirectLocation()
    } catch {
      dispatch(notify(accountSelfDeletionFailed()))
    }
  }

  return (
    <Overlay visible={true} testID="delete-org--overlay">
      <Overlay.Container maxWidth={400}>
        <Overlay.Header title="Delete Organization" onDismiss={handleClose} />
        <Overlay.Body>
          <Alert color={ComponentColor.Danger} icon={IconFont.AlertTriangle}>
            This action cannot be undone
          </Alert>
          <FlexBox
            alignItems={AlignItems.Center}
            direction={FlexDirection.Row}
            justifyContent={JustifyContent.FlexStart}
            margin={ComponentSize.Medium}
          >
            <DeleteOrgReasonsForm />
          </FlexBox>
          <ul style={{margin: '32px 0'}}>
            <li>
              The account for this Organization will be deleted immediately.
              This is irreversible and cannot be undone.
            </li>
            <li>
              Before continuing, you are responsible for exporting any data or
              content - including dashboards, tasks and variable - from the user
              interface.
            </li>
          </ul>
          <span
            onClick={() => setHasAgreedToTerms(prev => !prev)}
            data-testid="agree-terms--input"
          >
            <FlexBox
              alignItems={AlignItems.Center}
              direction={FlexDirection.Row}
              justifyContent={JustifyContent.FlexStart}
              margin={ComponentSize.Medium}
              stretchToFitWidth={false}
            >
              <Input
                className="agree-terms-input"
                checked={hasAgreedToTerms}
                onChange={() => setHasAgreedToTerms(prev => !prev)}
                size={ComponentSize.ExtraSmall}
                titleText="I understand and agree to these conditions"
                type={InputType.Checkbox}
                testID="agree-terms--checkbox"
              />
              <InputLabel active={hasAgreedToTerms} size={ComponentSize.Small}>
                I understand and agree to these conditions
              </InputLabel>
            </FlexBox>
          </span>
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            color={ComponentColor.Danger}
            text="Delete Organization"
            testID="delete-organization--button"
            status={
              isFormValid ? ComponentStatus.Default : ComponentStatus.Disabled
            }
            onClick={handleDeleteAccount}
          />
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}

export default DeleteOrgOverlay
