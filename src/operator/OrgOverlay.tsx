// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {
  ButtonBase,
  ButtonShape,
  Columns,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Form,
  Gradients,
  Grid,
  InputType,
  LinkButton,
  LinkTarget,
  Overlay,
  Panel,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/operator/context/overlay'
import {OperatorContext} from 'src/operator/context/operator'

// Utils
import {fromDisplayLimits} from 'src/operator/utils'

// Components
import LimitsField from 'src/operator/LimitsField'

// Constants
import {TOOLS_URL} from 'src/shared/constants'

const viewUsageButtonStyles = {marginRight: '12px'}
const reactivateOrgButtonStyles = {marginTop: '8px'}

const OrgOverlay: FC = () => {
  const {
    limits,
    limitsStatus,
    handleGetLimits,
    handleGetOrg,
    handleReactivateOrg,
    handleUpdateLimits,
    organization,
    orgStatus,
    reactivateOrgStatus,
    setLimits,
    updateLimitStatus,
  } = useContext(OverlayContext)
  const {hasWritePermissions} = useContext(OperatorContext)

  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()
  const canReactivateOrg =
    hasWritePermissions && organization?.state === 'suspended'
  const isIOx =
    organization?.storageType &&
    organization.storageType.toLowerCase() === 'iox'
  const canSeeCardinalityLimits = !isIOx

  useEffect(() => {
    handleGetLimits(orgID)
  }, [handleGetLimits, orgID])

  useEffect(() => {
    handleGetOrg(orgID)
  }, [handleGetOrg, orgID])

  const updateLimits = async () => {
    try {
      const backendLimits = fromDisplayLimits(limits)
      await handleUpdateLimits(orgID, backendLimits)
      history.goBack()
    } catch {
      // We want to keep the operator on the overlay if an error occurred
      // If an error occurs the operator will be notified when the API function fails
      return
    }
  }

  const reactivateOrg = async () => {
    await handleReactivateOrg(orgID)
    history.goBack()
  }

  return (
    <Overlay
      visible={true}
      renderMaskElement={() => (
        <Overlay.Mask gradient={Gradients.PowerStone} style={{opacity: 0.5}} />
      )}
      testID="org-overlay"
      transitionDuration={0}
    >
      <Overlay.Container maxWidth={1000}>
        <Overlay.Header
          title={orgID}
          className="overlay-header--color overlay-header--title"
          onDismiss={() => history.goBack()}
        />
        <SpinnerContainer
          loading={orgStatus}
          spinnerComponent={<TechnoSpinner diameterPixels={100} />}
        >
          <Overlay.Body>
            <Panel.Body>
              <Grid>
                <Grid.Row>
                  <Grid.Column widthMD={Columns.Four}>
                    <label>Organization Name</label>
                    <p>{organization?.name ?? ''}</p>
                  </Grid.Column>
                  <Grid.Column widthMD={Columns.Four}>
                    <label>Account Type</label>
                    <p>{organization?.account?.type ?? ''}</p>
                  </Grid.Column>
                  <Grid.Column widthMD={Columns.Four}>
                    <LinkButton
                      color={ComponentColor.Secondary}
                      size={ComponentSize.Medium}
                      shape={ButtonShape.Default}
                      testID="usage-button"
                      text="View Usage Dashboard"
                      target={LinkTarget.Blank}
                      className="overlay-button--link"
                      style={viewUsageButtonStyles}
                      href={`${TOOLS_URL}orgs/5d59ccc5163fc318/dashboards/0988da0fd78a7003?vars%5Borgid%5D=${orgID}`}
                    />
                    {canReactivateOrg && (
                      <ButtonBase
                        color={ComponentColor.Primary}
                        shape={ButtonShape.Default}
                        size={ComponentSize.Medium}
                        onClick={reactivateOrg}
                        style={reactivateOrgButtonStyles}
                        status={
                          reactivateOrgStatus === RemoteDataState.Loading
                            ? ComponentStatus.Disabled
                            : ComponentStatus.Default
                        }
                        testID="org-overlay-reactivate-organization--button"
                      >
                        Reactivate Organization
                      </ButtonBase>
                    )}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column widthMD={Columns.Four}>
                    <label>Organization State</label>
                    <p>{organization?.state ?? ''}</p>
                  </Grid.Column>
                </Grid.Row>
                <SpinnerContainer
                  loading={limitsStatus}
                  spinnerComponent={<TechnoSpinner diameterPixels={100} />}
                  testID="limits-spinner-container"
                >
                  <Grid.Row>
                    <h4>Limits</h4>
                    <Grid.Column widthMD={Columns.Four}>
                      <Form.Label label="Read (KB/s)" testID="read-kbs" />
                      <LimitsField
                        type={InputType.Number}
                        name="rate.readKBs"
                        limits={limits}
                        onChangeLimits={setLimits}
                      />
                    </Grid.Column>
                    <Grid.Column widthMD={Columns.Four}>
                      <Form.Label label="Write (KB/s)" />
                      <LimitsField
                        type={InputType.Number}
                        name="rate.writeKBs"
                        limits={limits}
                        onChangeLimits={setLimits}
                      />
                    </Grid.Column>
                    {canSeeCardinalityLimits && (
                      <Grid.Column widthMD={Columns.Four}>
                        <Form.Label label="Series Cardinality" />
                        <LimitsField
                          type={InputType.Number}
                          name="rate.cardinality"
                          limits={limits}
                          onChangeLimits={setLimits}
                        />
                      </Grid.Column>
                    )}
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column widthMD={Columns.Four}>
                      <Form.Label label="Query Time (seconds)" />
                      <LimitsField
                        type={InputType.Number}
                        name="rate.queryTime"
                        limits={limits}
                        onChangeLimits={setLimits}
                      />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column widthMD={Columns.Four}>
                      <Form.Label label="Max Buckets" />
                      <LimitsField
                        type={InputType.Number}
                        name="bucket.maxBuckets"
                        limits={limits}
                        onChangeLimits={setLimits}
                      />
                    </Grid.Column>
                    <Grid.Column widthMD={Columns.Four}>
                      <Form.Label label="Max Retention Duration (hours)" />
                      <LimitsField
                        type={InputType.Number}
                        name="bucket.maxRetentionDuration"
                        limits={limits}
                        onChangeLimits={setLimits}
                      />
                    </Grid.Column>
                    <Grid.Column widthMD={Columns.Four}>
                      <Form.Label label="Max Notifications" />
                      <LimitsField
                        type={InputType.Number}
                        name="notificationRule.maxNotifications"
                        limits={limits}
                        onChangeLimits={setLimits}
                      />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column widthMD={Columns.Four}>
                      <Form.Label label="Max Dashboards" />
                      <LimitsField
                        type={InputType.Number}
                        name="dashboard.maxDashboards"
                        limits={limits}
                        onChangeLimits={setLimits}
                      />
                    </Grid.Column>
                    <Grid.Column widthMD={Columns.Four}>
                      <Form.Label label="Max Tasks" />
                      <LimitsField
                        type={InputType.Number}
                        name="task.maxTasks"
                        limits={limits}
                        onChangeLimits={setLimits}
                      />
                    </Grid.Column>
                    <Grid.Column widthMD={Columns.Four}>
                      <Form.Label label="Max Checks" />
                      <LimitsField
                        type={InputType.Number}
                        name="check.maxChecks"
                        limits={limits}
                        onChangeLimits={setLimits}
                      />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <h4>Notification Rules</h4>
                    <Grid.Column widthMD={Columns.Four}>
                      <Form.Label label="Blocked Notification Rules" />
                      <LimitsField
                        type={InputType.Text}
                        name="notificationRule.blockedNotificationRules"
                        limits={limits}
                        onChangeLimits={setLimits}
                      />
                    </Grid.Column>
                    <Grid.Column widthMD={Columns.Four}>
                      <Form.Label label="Blocked Notification Endpoints" />
                      <LimitsField
                        type={InputType.Text}
                        name="notificationEndpoint.blockedNotificationEndpoints"
                        limits={limits}
                        onChangeLimits={setLimits}
                      />
                    </Grid.Column>
                  </Grid.Row>
                </SpinnerContainer>
              </Grid>
            </Panel.Body>
          </Overlay.Body>
          <Overlay.Footer>
            {hasWritePermissions && (
              <>
                <ButtonBase
                  color={ComponentColor.Default}
                  onClick={() => history.goBack()}
                  testID="org-overlay--cancel-button"
                >
                  Cancel
                </ButtonBase>
                <ButtonBase
                  color={ComponentColor.Primary}
                  onClick={updateLimits}
                  testID="org-overlay--submit-button"
                  status={
                    updateLimitStatus === RemoteDataState.Error
                      ? ComponentStatus.Disabled
                      : ComponentStatus.Default
                  }
                >
                  Submit Changes
                </ButtonBase>
              </>
            )}
          </Overlay.Footer>
        </SpinnerContainer>
      </Overlay.Container>
    </Overlay>
  )
}

export default OrgOverlay
