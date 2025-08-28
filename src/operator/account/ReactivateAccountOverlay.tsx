import React, {FC, useContext} from 'react'
import {
  Alert,
  ButtonBase,
  ButtonShape,
  ComponentColor,
  ComponentStatus,
  Gradients,
  IconFont,
  Overlay,
  RemoteDataState,
} from '@influxdata/clockface'
import {AccountContext} from 'src/operator/context/account'

const ReactivateAccountOverlay: FC = () => {
  const {
    account,
    organizations,
    reactivateStatus,
    handleReactivateAccount,
    setReactivateOverlayVisible,
    reactivateOverlayVisible,
  } = useContext(AccountContext)

  const reactivateAccount = () => {
    if (account?.reactivatable) {
      try {
        handleReactivateAccount()
      } catch (e) {
        setReactivateOverlayVisible(false)
      }
    }
  }

  const message = `
    This action will reactivate the Account
    ${account?.id ?? 'N/A'} and unsuspend the organizations:`

  const active = reactivateStatus === RemoteDataState.NotStarted

  return (
    <Overlay
      visible={reactivateOverlayVisible}
      renderMaskElement={() => (
        <Overlay.Mask gradient={Gradients.DangerDark} style={{opacity: 0.5}} />
      )}
      testID="reactivate-overlay"
      transitionDuration={0}
    >
      <Overlay.Container maxWidth={600}>
        <Overlay.Header
          title="Reactivate Account"
          style={{color: '#FFFFFF'}}
          onDismiss={() => setReactivateOverlayVisible(false)}
        />
        <Overlay.Body>
          <Alert color={ComponentColor.Danger} icon={IconFont.AlertTriangle}>
            This action cannot be undone
          </Alert>
          <h4 style={{color: '#FFFFFF'}}>
            <strong>Warning</strong>
          </h4>
          {message}
          <ul>
            {organizations.map(o => (
              <li key={o.id}>{o.name ?? 'N/A'} </li>
            ))}
          </ul>
        </Overlay.Body>
        <Overlay.Footer>
          <ButtonBase
            color={ComponentColor.Primary}
            shape={ButtonShape.Default}
            onClick={reactivateAccount}
            testID="reactivate-account--confirmation-button"
            active={active}
            status={active ? ComponentStatus.Default : ComponentStatus.Disabled}
          >
            I understand, reactivate account.
          </ButtonBase>
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}

export default ReactivateAccountOverlay
