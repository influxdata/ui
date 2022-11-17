// Libraries
import React, {FC, useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  Alert,
  AlignItems,
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Dropdown,
  FlexBox,
  FlexDirection,
  Form,
  IconFont,
  JustifyContent,
  Overlay,
  SelectableCard,
} from '@influxdata/clockface'

// Components
import {InputWithLabel} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/InputWithLabel'
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Styles
import './CreateOrganizationOverlay.scss'

// API
import {createNewOrg, fetchClusterList} from 'src/identity/apis/org'

// Types
import {Cluster, OrganizationCreateRequest} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'
import {UnauthorizedError, UnprocessableEntityError} from 'src/types/error'

enum OrgOverlayError {
  ClusterFetchFailedError = 'Failed to retrieve cluster data. Please try again later.',
  DefaultError = 'Organization creation failed.',
  NameConflictError = 'This organization name already exists. Please choose a different name.',
  None = '',
  OrgLimitError = 'You cannot create more organizations without upgrading this account.',
  UnauthorizedError = 'You are not authorized to create this organization.',
}

// Logos
import {AWSLogo} from './ProviderLogos/AWSLogo'
import {AzureLogo} from './ProviderLogos/AzureLogo'
import {GCPLogo} from './ProviderLogos/GCPLogo'

// Selectors
import {
  selectQuartzOrgsContents,
  selectQuartzOrgsStatus,
  selectCurrentAccountId,
} from 'src/identity/selectors'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {orgCreateSuccess} from 'src/shared/copy/notifications'

// Thunks
import {getQuartzOrganizationsThunk} from 'src/identity/quartzOrganizations/actions/thunks'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

const providerLogos = {
  AWS: <AWSLogo />,
  Azure: <AzureLogo />,
  GCP: <GCPLogo />,
}

const errorStyle = {
  margin: '20px 0',
}

export const CreateOrganizationOverlay: FC = () => {
  const dispatch = useDispatch()
  const {onClose} = useContext(OverlayContext)

  // Selectors
  const currentAccountId = useSelector(selectCurrentAccountId)
  const organizations = useSelector(selectQuartzOrgsContents)
  const orgsLoadedStatus = useSelector(selectQuartzOrgsStatus)

  // Local State
  // Overlay Dropdown State
  const [availableProviders, setAvailableProviders] = useState({})
  const [currentProvider, setCurrentProvider] = useState(null)
  const [currentRegion, setCurrentRegion] = useState(null)
  const [newOrgName, setNewOrgName] = useState('')

  const providerNames = Object.keys(availableProviders)
  const numProviders = providerNames.length
  const providersHaveLoaded = numProviders > 0

  // Error Messaging State
  const [createOrgButtonStatus, setCreateOrgButtonStatus] = useState(
    ComponentStatus.Disabled
  )
  const [errorMsg, setErrorMsg] = useState(OrgOverlayError.None)
  const [validationMsg, setValidationMsg] = useState('')
  const [showValidationMsg, setShowValidationMsg] = useState(false)

  // Event Handlers
  const handleCreateOrg = async () => {
    try {
      setCreateOrgButtonStatus(ComponentStatus.Loading)
      await createNewOrg({
        orgName: newOrgName,
        provider: currentProvider,
        region: currentRegion,
      })
      setCreateOrgButtonStatus(ComponentStatus.Default)
      onClose()
      dispatch(notify(orgCreateSuccess()))
      // Will make another API call to the allowance endpoint here for this issue.
      // https://github.com/influxdata/ui/issues/6267

      // Add in parallel global header change to ensure this is updated simultaneously.
      dispatch(getQuartzOrganizationsThunk(currentAccountId))
    } catch (err) {
      if (err instanceof UnprocessableEntityError) {
        // Quartz's 422 unprocessable entity status is interpreted as a name conflict for this overlay.
        setErrorMsg(OrgOverlayError.NameConflictError)
      } else if (err instanceof UnauthorizedError) {
        setErrorMsg(OrgOverlayError.UnauthorizedError)
      } else {
        setErrorMsg(OrgOverlayError.DefaultError)
      }
      // Add in Forbidden Error (403) after this change is merged.
      // https://github.com/influxdata/ui/pull/6311
      setCreateOrgButtonStatus(ComponentStatus.Error)
    }
  }

  const handleValidateOrgName = (evt: any) => {
    setErrorMsg(OrgOverlayError.None)

    const proposedOrgName = evt.target.value
    setNewOrgName(proposedOrgName)

    if (proposedOrgName.trim() === '') {
      setCreateOrgButtonStatus(ComponentStatus.Disabled)
      return
    }

    if (organizations.find(oldOrg => oldOrg.name === proposedOrgName)) {
      setValidationMsg(OrgOverlayError.NameConflictError)
      setShowValidationMsg(true)
      setCreateOrgButtonStatus(ComponentStatus.Disabled)
    } else {
      setValidationMsg(OrgOverlayError.None)
      setShowValidationMsg(false)
      setCreateOrgButtonStatus(ComponentStatus.Default)
    }
  }

  const handleSelectProvider = (
    providerID: OrganizationCreateRequest['provider']
  ) => {
    setCurrentProvider(providerID)
    const defaultRegion = availableProviders[providerID][0].regionId
    setCurrentRegion(defaultRegion)
  }

  // Ajax requests
  useEffect(() => {
    if (orgsLoadedStatus === RemoteDataState.NotStarted) {
      dispatch(getQuartzOrganizationsThunk(currentAccountId))
    }
  }, [currentAccountId, orgsLoadedStatus, dispatch])

  useEffect(() => {
    const retrieveClusters = async () => {
      try {
        const clusterArr = await fetchClusterList()
        if (!clusterArr.length) {
          setCreateOrgButtonStatus(ComponentStatus.Disabled)
          return
        }

        const availableProviders = {}

        clusterArr.forEach(cluster => {
          const {providerId} = cluster
          if (!availableProviders[providerId]) {
            availableProviders[providerId] = [cluster]
          } else {
            availableProviders[providerId].push(cluster)
          }
        })
        for (const provider in availableProviders) {
          availableProviders[provider].sort(
            (a: Cluster, b: Cluster) => a.priority - b.priority
          )
        }

        setAvailableProviders(availableProviders)

        const defaultProvider = Object.keys(availableProviders)[0]
        setCurrentProvider(availableProviders[defaultProvider][0].providerId)
        setCurrentRegion(availableProviders[defaultProvider][0].regionId)
      } catch (err) {
        setErrorMsg(OrgOverlayError.ClusterFetchFailedError)
      }
    }
    retrieveClusters()
  }, [])

  return (
    <Overlay.Container
      maxWidth={800}
      className="create-org-overlay-container"
      testID="create-org-overlay--container"
    >
      <Overlay.Header
        testID="create-org-overlay-header"
        title="Create an Organization"
        onDismiss={onClose}
      />
      <Overlay.Body>
        {errorMsg !== OrgOverlayError.None && (
          <Alert
            style={errorStyle}
            color={ComponentColor.Danger}
            icon={IconFont.AlertTriangle}
          >
            {errorMsg}
          </Alert>
        )}
        <FlexBox
          direction={FlexDirection.Column}
          className="create-org-overlay-body"
        >
          <InputWithLabel
            value={newOrgName}
            required={true}
            label="Organization Name"
            onChange={handleValidateOrgName}
            placeholder="Dev Team, US Eastern Region, Staging"
            description="You may want to create separate organizations for each team, server region, or dev environment."
            errorMessage={validationMsg}
            showError={showValidationMsg}
            status={
              providersHaveLoaded
                ? ComponentStatus.Default
                : ComponentStatus.Disabled
            }
          />
          <FlexBox
            alignItems={AlignItems.FlexStart}
            className="provider-and-region-chooser"
            direction={FlexDirection.Column}
            justifyContent={JustifyContent.Center}
            margin={ComponentSize.Large}
            stretchToFitWidth={true}
          >
            <Form.Element
              htmlFor="Organization Name"
              label="Organization Name"
              className="prc-label"
            >
              <Form.HelpText
                className="prc-description"
                text="Tell us where you would like to store the time series data for this organization."
              />
            </Form.Element>
            <FlexBox
              alignItems={AlignItems.Stretch}
              className="prc-cluster-boxes-container"
              justifyContent={JustifyContent.FlexStart}
              stretchToFitWidth={true}
              direction={FlexDirection.Column}
            >
              <FlexBox
                alignItems={AlignItems.Stretch}
                className="prc-cluster-boxes"
                stretchToFitWidth={true}
              >
                {numProviders === 1 ? (
                  <div className="cluster-box-logo">
                    Need the code for a single cluster box here.
                  </div>
                ) : (
                  providerNames.map((providerId, idx) => {
                    const {providerName} = availableProviders[providerId][0]
                    return (
                      <SelectableCard
                        fontSize={ComponentSize.ExtraSmall}
                        className={`clusterbox--selectable-card ${
                          providerId === currentProvider ? 'selected' : ''
                        }`}
                        id={providerId}
                        key={`${providerId}${idx}`}
                        onClick={handleSelectProvider}
                        label={providerName}
                        selected={providerId === currentProvider}
                      >
                        {providerLogos[providerId]}
                      </SelectableCard>
                    )
                  })
                )}
              </FlexBox>
              <Dropdown
                button={(active, onClick) => (
                  <Dropdown.Button
                    status={
                      providersHaveLoaded
                        ? ComponentStatus.Default
                        : ComponentStatus.Disabled
                    }
                    active={active}
                    onClick={onClick}
                    testID="region-list-dropdown--button"
                  >
                    {
                      availableProviders[currentProvider]?.find(
                        (cluster: Cluster) => cluster.regionId === currentRegion
                      )?.regionName
                    }
                  </Dropdown.Button>
                )}
                menu={onCollapse => (
                  <Dropdown.Menu onCollapse={onCollapse}>
                    {availableProviders[currentProvider]?.map(
                      (cluster: Cluster) => (
                        <Dropdown.Item
                          key={cluster.regionId}
                          id={cluster.regionId}
                          value={cluster.regionId}
                          onClick={setCurrentRegion}
                          testID={`region-list-dropdown--${cluster.regionId}`}
                          selected={currentRegion === cluster.regionId}
                        >
                          {cluster.regionName}
                        </Dropdown.Item>
                      )
                    )}
                  </Dropdown.Menu>
                )}
              />
            </FlexBox>
            <div className="region-info">
              <Form.HelpText text="Don't see the region you need?"></Form.HelpText>{' '}
              <SafeBlankLink href="https://www.influxdata.com/influxdb-cloud-2-0-provider-region/">
                Let us know
              </SafeBlankLink>
              <Form.HelpText text="."></Form.HelpText>
            </div>
          </FlexBox>
        </FlexBox>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="Cancel"
          testID="create-org-form-cancel"
          color={ComponentColor.Default}
          onClick={onClose}
        />
        <Button
          text="Create Organization"
          testID="create-org-form-submit"
          color={ComponentColor.Primary}
          status={createOrgButtonStatus}
          onClick={handleCreateOrg}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}
