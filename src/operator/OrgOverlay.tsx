import {AxiosResponse} from 'axios'
import {get} from 'lodash'
import React, {FC, useCallback, useEffect, useState} from 'react'
import {
  RouteComponentProps,
  useHistory,
  useParams,
  withRouter,
} from 'react-router-dom'

import {
  Alert,
  ButtonBase,
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Form,
  Gradients,
  Grid,
  IconFont,
  InputType,
  LinkButton,
  LinkTarget,
  Overlay,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

import {Organization} from 'src/types/operator'
// import {Limits} from 'src/types/billing'
import LimitsInput from 'src/operator/LimitsInput'
import {fromDisplayLimits, toDisplayLimits} from 'src/operator/utils'

interface Props {
  fetchOrganization: (idpeID: string) => Promise<Organization>
  fetchLimits: (idpeID: string) => Promise<any>
  updateLimits: (id: string, limits: any) => Promise<AxiosResponse<any>>
  // fetchLimits: (idpeID: string) => Promise<Limits>
  // updateLimits: (id: string, limits: Limits) => Promise<AxiosResponse<Limits>>
}

const OrgOverlay: FC<Props & RouteComponentProps> = props => {
  const [organization, setOrganization] = useState(null)
  const [orgStatus, setOrgStatus] = useState(RemoteDataState.NotStarted)
  const [limitsStatus, setLimitsStatus] = useState(RemoteDataState.NotStarted)
  const [limitUpdateStatus, setLimitUpdateStatus] = useState(
    RemoteDataState.NotStarted
  )
  const [limits, setLimits] = useState(null)

  const {orgID: idpeID} = useParams()
  const {fetchOrganization: onFetchOrganization} = props
  const {fetchLimits: onFetchLimits} = props

  const fetchOrganization = useCallback(async () => {
    try {
      setOrgStatus(RemoteDataState.Loading)
      const organization = await onFetchOrganization(idpeID)
      setOrganization(organization)
      setOrgStatus(RemoteDataState.Done)
    } catch (e) {
      console.error(e)
      setOrgStatus(RemoteDataState.Error)
    }
  }, [idpeID, onFetchOrganization])

  const fetchLimits = useCallback(async () => {
    try {
      setLimitsStatus(RemoteDataState.Loading)
      const limits = await onFetchLimits(idpeID)
      const displayLimits = toDisplayLimits(limits)
      setLimits(displayLimits)
      setLimitsStatus(RemoteDataState.Done)
    } catch (e) {
      console.error(e)
      setLimitsStatus(RemoteDataState.Error)
    }
  }, [idpeID, onFetchLimits])

  useEffect(() => {
    fetchOrganization()
    fetchLimits()
  }, [fetchOrganization, fetchLimits, idpeID])
  const history = useHistory()

  const setInputs = limits => {
    setLimits(limits)
  }

  const updateLimits = async () => {
    try {
      setLimitUpdateStatus(RemoteDataState.Loading)
      const backendLimits = fromDisplayLimits(limits)
      await props.updateLimits(idpeID, backendLimits)
      setLimitUpdateStatus(RemoteDataState.Done)
      history.goBack()
    } catch (e) {
      console.error(e)
      setLimitUpdateStatus(RemoteDataState.Error)
    }
  }

  const fetchError =
    orgStatus === RemoteDataState.Error ||
    limitsStatus === RemoteDataState.Error

  const requestError = fetchError || limitUpdateStatus === RemoteDataState.Error

  const alertMessage = () => {
    if (orgStatus === RemoteDataState.Error) {
      return `Could not find organization with ID ${idpeID}`
    }

    if (limitsStatus === RemoteDataState.Error) {
      return 'Could not fetch limits for this organization'
    }

    if (limitUpdateStatus === RemoteDataState.Error) {
      return 'Could not update limits for this organization'
    }
  }

  const limitSpinnerStatus = () => {
    if (
      limitsStatus === RemoteDataState.Loading ||
      limitUpdateStatus === RemoteDataState.Loading
    ) {
      return RemoteDataState.Loading
    }

    return limitsStatus
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
          title={idpeID}
          style={{color: '#FFFFFF'}}
          onDismiss={() => history.goBack()}
        />
        <SpinnerContainer
          loading={orgStatus}
          spinnerComponent={<TechnoSpinner diameterPixels={100} />}
        >
          <Overlay.Body>
            {requestError && (
              <Alert
                color={ComponentColor.Danger}
                icon={IconFont.AlertTriangle}
                style={{marginBottom: '16px'}}
              >
                {alertMessage()}
              </Alert>
            )}
            <Grid>
              <Grid.Row>
                <Grid.Column widthMD={4}>
                  <label>Organization Name</label>
                  <p>{get(organization, 'name', '')}</p>
                </Grid.Column>
                <Grid.Column widthMD={4}>
                  <label>Account Type</label>
                  <p>{get(organization, 'account.type', '')}</p>
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
                    href={`https://influxdb.aws.influxdata.io/orgs/844910ece80be8bc/dashboards/0649b03029c49000?vars%5Borgid%5D=${idpeID}`}
                  />
                </Grid.Column>
              </Grid.Row>
              <SpinnerContainer
                loading={limitSpinnerStatus()}
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
                      onChangeLimits={setInputs}
                    />
                  </Grid.Column>
                  <Grid.Column widthMD={3}>
                    <Form.Label label="Blocked Notification Endpoints" />
                    <LimitsInput
                      type={InputType.Text}
                      name="notificationEndpoint.blockedNotificationEndpoints"
                      limits={limits}
                      onChangeLimits={setInputs}
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
                fetchError ? ComponentStatus.Disabled : ComponentStatus.Default
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

export default withRouter(OrgOverlay)
