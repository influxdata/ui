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
import {OperatorAccount} from 'src/client/unityRoutes'
import {OverlayContext} from './context/overlay'

interface Props {
  toAccount: OperatorAccount
}

const MigrateOrgOverlay: FC<Props> = ({toAccount}) => {
  const {
    organization,
    migrateOverlayVisible,
    setMigrateOverlayVisible,
    handleMigrateOrg,
    migrateStatus,
  } = useContext(OverlayContext)

  const migrateOrg = () => {
    try {
      handleMigrateOrg(organization.idpeId, toAccount.id.toString())
    } catch (e) {
      setMigrateOverlayVisible(false)
    }
  }

  const message = `
    This action will migrate the following organization and users 
    from ${organization.account.id ?? 'N/A'} to 
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
          title="Migrate Organization"
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
            <li>
              {organization.name ?? 'N/A'} ({organization.idpeId})
            </li>
          </ul>
        </Overlay.Body>
        <Overlay.Footer>
          <ButtonBase
            color={ComponentColor.Primary}
            shape={ButtonShape.Default}
            onClick={migrateOrg}
            testID="migrate-organization--confirmation-button"
            active={active}
            status={active ? ComponentStatus.Default : ComponentStatus.Disabled}
          >
            I understand, migrate the organization
          </ButtonBase>
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}

export default MigrateOrgOverlay
