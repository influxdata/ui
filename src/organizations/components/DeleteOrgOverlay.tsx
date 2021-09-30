// Libraries
import React, {FC, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'
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

// Utils
import {deleteAccount} from 'src/client/unityRoutes'
import {notify} from 'src/shared/actions/notifications'
import {accountSelfDeletionFailed} from 'src/shared/copy/notifications'

const DeleteOrgOverlay: FC = () => {
  const history = useHistory()
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const dispatch = useDispatch()

  const handleClose = () => {
    history.goBack()
  }

  const handleDeleteAccount = async () => {
    try {
      const resp = await deleteAccount({})

      if (resp.status !== 204) {
        throw new Error(resp.data.message)
      }

      window.location.href = `https://www.influxdata.com/free_cancel/`
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
              hasAgreedToTerms
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

export default DeleteOrgOverlay
