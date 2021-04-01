import React, {FC, useContext} from 'react'
import {
  Overlay,
  Gradients,
  Alert,
  ComponentColor,
  IconFont,
  ButtonBase,
  ButtonShape,
} from '@influxdata/clockface'
import {AccountContext} from 'src/operator/context/account'

const DeleteAccountOverlay: FC = () => {
  const {account, handleDeleteAccount, setVisible, visible} = useContext(
    AccountContext
  )

  const deleteAccount = () => {
    if (account?.deletable) {
      try {
        handleDeleteAccount()
      } catch (e) {
        setVisible(false)
      }
    }
  }

  const message = `
    This action will permanently delete the Account
    ${account?.id ?? 'N/A'} for user
    ${account?.billingContact?.email ?? 'N/A'} and organization
    ${account?.organizations?.[0]?.name ?? 'N/A'}.`
  return (
    <Overlay
      visible={visible}
      renderMaskElement={() => (
        <Overlay.Mask gradient={Gradients.DangerDark} style={{opacity: 0.5}} />
      )}
      testID="delete-overlay"
      transitionDuration={0}
    >
      <Overlay.Container maxWidth={600}>
        <Overlay.Header
          title="Delete Account"
          style={{color: '#FFFFFF'}}
          onDismiss={() => setVisible(!visible)}
        />
        <Overlay.Body>
          <Alert color={ComponentColor.Danger} icon={IconFont.AlertTriangle}>
            This action cannot be undone
          </Alert>
          <h4 style={{color: '#FFFFFF'}}>
            <strong>Warning</strong>
          </h4>
          {message}
        </Overlay.Body>
        <Overlay.Footer>
          <ButtonBase
            color={ComponentColor.Danger}
            shape={ButtonShape.Default}
            onClick={deleteAccount}
            testID="confirmation-button"
          >
            I understand, delete account.
          </ButtonBase>
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}

export default DeleteAccountOverlay
