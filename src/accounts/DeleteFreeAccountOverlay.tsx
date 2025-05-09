// Libraries
import React, {FC, useContext, useMemo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
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

// Context
import {
  DeleteFreeAccountContext,
  VariableItems,
} from 'src/accounts/context/DeleteFreeAccountContext'

// Selectors
import {selectCurrentIdentity, selectCurrentOrg} from 'src/identity/selectors'

// Utils
import {deleteAccount} from 'src/client/unityRoutes'
import {notify} from 'src/shared/actions/notifications'
import {accountSelfDeletionFailed} from 'src/shared/copy/notifications'
import {DeleteFreeAccountReasonsForm} from 'src/accounts/DeleteFreeAccountReasonsForm'
import {event} from 'src/cloud/utils/reporting'

export const DeleteFreeAccountOverlay: FC = () => {
  const history = useHistory()
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const dispatch = useDispatch()
  const {reason, shortSuggestion, suggestions, getRedirectLocation} =
    useContext(DeleteFreeAccountContext)
  const {user, account} = useSelector(selectCurrentIdentity)
  const org = useSelector(selectCurrentOrg)
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = () => {
    const payload = {
      org: org.id,
      tier: account.type,
      email: user.email,
    }
    event('delete_free_account_overlay.dismissed', payload)

    history.goBack()
  }

  const isFormValid = useMemo(() => {
    // Has Agreed to Terms & Conditions
    // as well as
    // Selected an option from the Reasons Dropdown
    return hasAgreedToTerms && VariableItems[reason] !== VariableItems.NO_OPTION
  }, [hasAgreedToTerms, reason])

  const handleDeleteAccount = async () => {
    setIsLoading(true)

    const payload = {
      org: org.id,
      tier: account.type,
      email: user.email,
      alternativeProduct: shortSuggestion,
      suggestions,
      reason: VariableItems[reason],
    }

    try {
      const resp = await deleteAccount({})
      event('delete_free_account_overlay.executed', payload)

      if (resp.status !== 204) {
        throw new Error(resp.data.message)
      }

      window.location.href = getRedirectLocation()
    } catch {
      dispatch(notify(accountSelfDeletionFailed()))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Overlay visible={true} testID="delete-free-account--overlay">
      <Overlay.Container maxWidth={400}>
        <Overlay.Header title="Delete Account" onDismiss={handleClose} />
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
            <DeleteFreeAccountReasonsForm />
          </FlexBox>
          <ul className="account-settings-deleteAccount--overlay">
            <li>
              The account for this Organization will be deleted immediately.
              This is irreversible and cannot be undone.
            </li>
            <li>
              Before continuing, you are responsible for exporting any data or
              content - including dashboards, tasks, and variables - from the
              user interface.
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
            text="Delete Account"
            testID="delete-free-account--button"
            status={
              isLoading
                ? ComponentStatus.Loading
                : isFormValid
                ? ComponentStatus.Default
                : ComponentStatus.Disabled
            }
            onClick={handleDeleteAccount}
          />
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}
