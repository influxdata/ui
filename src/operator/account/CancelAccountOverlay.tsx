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

const CancelAccountOverlay: FC = () => {
  const {
    account,
    handleDeleteAccount,
    setCancelOverlayVisible,
    cancelOverlayVisible,
  } = useContext(AccountContext)

  const cancelAccount = () => {
    if (account?.cancellable) {
      try {
        handleDeleteAccount()
      } catch (e) {
        setCancelOverlayVisible(false)
      }
    }
  }

  const message = `
    This action will permanently cancel the Account
    ${account?.id ?? 'N/A'} and all of its organizations. 
    Users that belong to multiple accounts are still able 
    to access their other accounts.`
  return (
    <Overlay
      visible={cancelOverlayVisible}
      renderMaskElement={() => (
        <Overlay.Mask gradient={Gradients.DangerDark} style={{opacity: 0.5}} />
      )}
      testID="cancel-overlay"
      transitionDuration={0}
    >
      <Overlay.Container maxWidth={600}>
        <Overlay.Header
          title="Cancel Account"
          style={{color: '#FFFFFF'}}
          onDismiss={() => setCancelOverlayVisible(!cancelOverlayVisible)}
        />
        <Overlay.Body>
          <Alert color={ComponentColor.Danger} icon={IconFont.AlertTriangle}>
            This will prevent users from accessing the account
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
            onClick={cancelAccount}
            testID="cancel-account--confirmation-button"
          >
            I understand, cancel account.
          </ButtonBase>
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}

export default CancelAccountOverlay
