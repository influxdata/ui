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
import {OperatorAccount} from 'src/client/unityRoutes'

interface Props {
  toAccount: OperatorAccount
}

export const MigrateOrgsOverlay: FC<Props> = ({toAccount}) => {
  const {
    account,
    organizations,
    handleMigrateOrgs,
    migrateOverlayVisible,
    migrateStatus,
    setMigrateOverlayVisible,
  } = useContext(AccountContext)

  const migrateAccountOrgs = () => {
    if (account?.type !== 'cancelled') {
      try {
        handleMigrateOrgs(toAccount.id.toString())
      } catch (e) {
        setMigrateOverlayVisible(false)
      }
    }
  }

  const message = `
    This action will migrate the following organizations and users 
    from ${account?.name ?? 'N/A'} (${account?.id ?? 'N/A'}) into 
    ${toAccount?.name} (${toAccount?.id})`

  const active = migrateStatus === RemoteDataState.NotStarted

  return (
    <Overlay
      visible={migrateOverlayVisible}
      renderMaskElement={() => (
        <Overlay.Mask gradient={Gradients.DangerDark} style={{opacity: 0.5}} />
      )}
      testID="migrate-overlay"
      transitionDuration={0}
    >
      <Overlay.Container maxWidth={600}>
        <Overlay.Header
          title="Migrate Account Organizations"
          style={{color: '#FFFFFF'}}
          onDismiss={() => setMigrateOverlayVisible(false)}
        />
        <Overlay.Body>
          <Alert color={ComponentColor.Danger} icon={IconFont.AlertTriangle}>
            This action cannot be undone
          </Alert>
          <h4 style={{color: '#FFFFFF'}}>
            <strong>Warning</strong>
          </h4>
          {message}
          <br />
          <strong>Organizations:</strong>
          <ul>
            {organizations.map(o => (
              <li key={o.id}>
                {o.name ?? 'N/A'} ({o.idpeId})
              </li>
            ))}
          </ul>
          <strong>Users:</strong>
          <ul>
            {account.users.map(u => (
              <li key={u.id}>
                {u.firstName} {u.lastName} ({u.email ?? 'N/A'})
              </li>
            ))}
          </ul>
        </Overlay.Body>
        <Overlay.Footer>
          <ButtonBase
            color={ComponentColor.Primary}
            shape={ButtonShape.Default}
            onClick={migrateAccountOrgs}
            testID="migrate-account--confirmation-button"
            active={active}
            status={active ? ComponentStatus.Default : ComponentStatus.Disabled}
          >
            I understand, run migration.
          </ButtonBase>
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}
