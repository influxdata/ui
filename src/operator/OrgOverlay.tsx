import React, {FC, useContext} from 'react'
import {useHistory, useParams} from 'react-router-dom'

import {
  ButtonBase,
  ButtonShape,
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
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

import {OverlayContext} from 'src/operator/context/overlay'
import LimitsInput from 'src/operator/LimitsInput'
import {fromDisplayLimits} from 'src/operator/utils'

const OrgOverlay: FC = () => {
  const {
    limits,
    limitsStatus,
    handleUpdateLimits,
    organization,
    orgStatus,
    setLimits,
    updateLimitStatus,
  } = useContext(OverlayContext)

  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()

  const updateLimits = async () => {
    try {
      const backendLimits = fromDisplayLimits(limits)
      await handleUpdateLimits(backendLimits)
      history.goBack()
    } catch (error) {
      console.error(error)
    }
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
          style={{color: '#FFFFFF'}}
          onDismiss={() => history.goBack()}
        />
        <SpinnerContainer
          loading={orgStatus}
          spinnerComponent={<TechnoSpinner diameterPixels={100} />}
        >
          <Overlay.Body>
            <Grid>
              <Grid.Row>
                <Grid.Column widthMD={4}>
                  <label>Organization Name</label>
                  <p>{organization?.name ?? ''}</p>
                </Grid.Column>
                <Grid.Column widthMD={4}>
                  <label>Account Type</label>
                  <p>{organization?.relatedAccount?.type ?? ''}</p>
                </Grid.Column>
                <Grid.Column widthMD={4}>
                  <LinkButton
                    color={ComponentColor.Secondary}
                    size={ComponentSize.Small}
                    shape={ButtonShape.Default}
                    style={{padding: '7px 10px'}}
                    testID="usage-button"
                    text="View Usage Dashboard"
                    target={LinkTarget.Blank}
                    href={`https://influxdb.aws.influxdata.io/orgs/844910ece80be8bc/dashboards/0649b03029c49000?vars%5Borgid%5D=${orgID}`}
                  />
                </Grid.Column>
              </Grid.Row>
              <SpinnerContainer
                loading={limitsStatus}
                spinnerComponent={<TechnoSpinner diameterPixels={100} />}
                testID="limits-spinner-container"
              >
                <Grid.Row>
                  <h4>Limits</h4>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Read (KBs)" testID="read-kbs" />
                    <LimitsInput
                      type={InputType.Number}
                      name="rate.readKBs"
                      limits={limits}
                      onChangeLimits={setLimits}
                    />
                  </Grid.Column>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Write (KBs)" />
                    <LimitsInput
                      type={InputType.Number}
                      name="rate.writeKBs"
                      limits={limits}
                      onChangeLimits={setLimits}
                    />
                  </Grid.Column>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Series Cardinality" />
                    <LimitsInput
                      type={InputType.Number}
                      name="rate.cardinality"
                      limits={limits}
                      onChangeLimits={setLimits}
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Max Buckets" />
                    <LimitsInput
                      type={InputType.Number}
                      name="bucket.maxBuckets"
                      limits={limits}
                      onChangeLimits={setLimits}
                    />
                  </Grid.Column>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Max Retention Duration (hours)"></Form.Label>
                    <LimitsInput
                      type={InputType.Number}
                      name="bucket.maxRetentionDuration"
                      limits={limits}
                      onChangeLimits={setLimits}
                    />
                  </Grid.Column>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Max Notifications" />
                    <LimitsInput
                      type={InputType.Number}
                      name="notificationRule.maxNotifications"
                      limits={limits}
                      onChangeLimits={setLimits}
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Max Dashboards" />
                    <LimitsInput
                      type={InputType.Number}
                      name="dashboard.maxDashboards"
                      limits={limits}
                      onChangeLimits={setLimits}
                    />
                  </Grid.Column>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Max Tasks" />
                    <LimitsInput
                      type={InputType.Number}
                      name="task.maxTasks"
                      limits={limits}
                      onChangeLimits={setLimits}
                    />
                  </Grid.Column>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Max Checks" />
                    <LimitsInput
                      type={InputType.Number}
                      name="check.maxChecks"
                      limits={limits}
                      onChangeLimits={setLimits}
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <h4>Notification Rules</h4>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Blocked Notification Rules" />
                    <LimitsInput
                      type={InputType.Text}
                      name="notificationRule.blockedNotificationRules"
                      limits={limits}
                      onChangeLimits={setLimits}
                    />
                  </Grid.Column>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Blocked Notification Endpoints" />
                    <LimitsInput
                      type={InputType.Text}
                      name="notificationEndpoint.blockedNotificationEndpoints"
                      limits={limits}
                      onChangeLimits={setLimits}
                    />
                  </Grid.Column>
                </Grid.Row>
              </SpinnerContainer>
            </Grid>
          </Overlay.Body>
          <Overlay.Footer>
            <ButtonBase
              color={ComponentColor.Default}
              onClick={() => history.goBack()}
              testID="cancel-button"
            >
              Cancel
            </ButtonBase>
            <ButtonBase
              color={ComponentColor.Primary}
              onClick={updateLimits}
              testID="submit-button"
              status={
                updateLimitStatus === RemoteDataState.Error
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
            >
              Submit Changes
            </ButtonBase>
          </Overlay.Footer>
        </SpinnerContainer>
      </Overlay.Container>
    </Overlay>
  )
}

export default OrgOverlay
