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
  FlexBox,
  FlexDirection,
  Form,
  IconFont,
  JustifyContent,
  Overlay,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Components
import {CreateOrgInput} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/CreateOrgInput'
import {OverlayContext} from 'src/overlays/components/OverlayController'
import {ProviderCards} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderCards'
import {RegionDropdown} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/RegionDropdown'

// Styles
import './CreateOrganizationOverlay.scss'

// API
import {createNewOrg, fetchClusterList} from 'src/identity/apis/org'

// Types
import {Cluster, OrganizationCreateRequest} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'
import {
  ForbiddenError,
  UnauthorizedError,
  UnprocessableEntityError,
} from 'src/types/error'

enum OrgOverlayNetworkError {
  ClusterFetchFailedError = 'Failed to retrieve cluster data. Please try again later.',
  DefaultError = 'Organization creation failed.',
  NameConflictError = 'This organization name already exists. Please choose a different name.',
  None = '',
  NoClusters = 'There are no available clusters in which a new organization can be created.',
  OrgLimitError = 'You cannot create more organizations without upgrading this account.',
  UnauthorizedError = 'You are not authorized to create this organization.',
}

export enum OrgOverlayValidationError {
  NameConflictError = 'This organization name already exists. Please choose a different name.',
  None = '',
}

export interface ProviderMap {
  [provider: string]: Cluster[]
}

enum ProviderSelectMessage {
  SingleProvider = 'This account uses the following provider and region to store time series data for this organization.',
  MultiProvider = 'Tell us where you would like to store the time series data for this organization',
}

// Selectors
import {
  selectCurrentAccountId,
  selectOrgCreationAllowance,
  selectOrgCreationAllowanceStatus,
  selectQuartzOrgs,
  selectQuartzOrgsStatus,
} from 'src/identity/selectors'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {orgCreateSuccess, orgQuotaReached} from 'src/shared/copy/notifications'

// Thunks
import {getQuartzOrganizationsThunk} from 'src/identity/quartzOrganizations/actions/thunks'
import {getOrgCreationAllowancesThunk} from 'src/identity/allowances/actions/thunks'

// Utils
import {generateProviderMap} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/utils/generateProviderMap'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

export const CreateOrganizationOverlay: FC = () => {
  const dispatch = useDispatch()
  const {onClose} = useContext(OverlayContext)

  // Selectors
  const currentAccountId = useSelector(selectCurrentAccountId)
  const organizations = useSelector(selectQuartzOrgs)
  const orgsLoadedStatus = useSelector(selectQuartzOrgsStatus)
  const orgCreationAllowed = useSelector(selectOrgCreationAllowance)
  const orgCreationAllowanceStatus = useSelector(
    selectOrgCreationAllowanceStatus
  )

  // Local State
  // Dropdown State
  const [providerMap, setProviderMap] = useState({})
  const [currentProvider, setCurrentProvider] = useState(null)
  const [currentRegion, setCurrentRegion] = useState(null)
  const [newOrgName, setNewOrgName] = useState('')
  const providerNames = Object.keys(providerMap)
  const numProviders = providerNames.length
  const providerHelpText =
    numProviders > 1
      ? ProviderSelectMessage.MultiProvider
      : ProviderSelectMessage.SingleProvider

  // Error Handling State
  const [createOrgButtonStatus, setCreateOrgButtonStatus] = useState(
    ComponentStatus.Disabled
  )
  const [networkErrorMsg, setNetworkErrorMsg] = useState(
    OrgOverlayNetworkError.None
  )
  const [validationMsg, setValidationMsg] = useState(
    OrgOverlayValidationError.None
  )

  // Spinner State
  const loadingComplete = Boolean(currentProvider) && Boolean(currentRegion)
  const loadingState = loadingComplete
    ? RemoteDataState.Done
    : RemoteDataState.Loading

  // Side effects
  useEffect(() => {
    if (orgsLoadedStatus === RemoteDataState.NotStarted) {
      dispatch(getQuartzOrganizationsThunk(currentAccountId))
    }
  }, [currentAccountId, orgsLoadedStatus, dispatch])

  useEffect(() => {
    if (orgCreationAllowanceStatus === RemoteDataState.NotStarted) {
      dispatch(getOrgCreationAllowancesThunk())
    }
  }, [dispatch, orgCreationAllowanceStatus])

  useEffect(() => {
    if (!orgCreationAllowed) {
      if (createOrgButtonStatus === ComponentStatus.Default) {
        setCreateOrgButtonStatus(ComponentStatus.Disabled)
      }

      if (networkErrorMsg !== OrgOverlayNetworkError.OrgLimitError) {
        setNetworkErrorMsg(OrgOverlayNetworkError.OrgLimitError)
      }
    }
  }, [createOrgButtonStatus, networkErrorMsg, orgCreationAllowed])

  useEffect(() => {
    const retrieveClusters = async () => {
      try {
        const clusterArr = await fetchClusterList()

        if (!clusterArr.length) {
          setCreateOrgButtonStatus(ComponentStatus.Disabled)
          setNetworkErrorMsg(OrgOverlayNetworkError.NoClusters)
          return
        }

        const currentProviderMap = generateProviderMap(clusterArr)
        const defaultProvider = Object.keys(currentProviderMap)[0]
        const defaultRegion = currentProviderMap[defaultProvider][0].regionId

        setProviderMap(currentProviderMap)
        setCurrentProvider(defaultProvider)
        setCurrentRegion(defaultRegion)
      } catch (err) {
        setNetworkErrorMsg(OrgOverlayNetworkError.ClusterFetchFailedError)
      }
    }
    retrieveClusters()
  }, [])

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
      dispatch(notify(orgCreateSuccess()))
      dispatch(getQuartzOrganizationsThunk(currentAccountId))
      Promise.resolve(dispatch(getOrgCreationAllowancesThunk())).then(
        allowed => {
          if (!allowed) {
            dispatch(notify(orgQuotaReached()))
          }
          onClose()
        }
      )
    } catch (err) {
      if (err instanceof UnprocessableEntityError) {
        setNetworkErrorMsg(OrgOverlayNetworkError.NameConflictError)
      } else if (err instanceof UnauthorizedError) {
        setNetworkErrorMsg(OrgOverlayNetworkError.UnauthorizedError)
      } else if (err instanceof ForbiddenError) {
        setNetworkErrorMsg(OrgOverlayNetworkError.OrgLimitError)
      } else {
        setNetworkErrorMsg(OrgOverlayNetworkError.DefaultError)
      }
      setCreateOrgButtonStatus(ComponentStatus.Error)
    }
  }

  const handleSelectProvider = (
    providerID: OrganizationCreateRequest['provider']
  ) => {
    setCurrentProvider(providerID)
    const defaultRegionId = providerMap[providerID][0].regionId
    setCurrentRegion(defaultRegionId)
  }

  const handleValidateOrgName = (proposedOrgName: string) => {
    setNetworkErrorMsg(OrgOverlayNetworkError.None)
    setNewOrgName(proposedOrgName)

    if (proposedOrgName.trim() === '') {
      setCreateOrgButtonStatus(ComponentStatus.Disabled)
      return
    }

    if (organizations.find(oldOrg => oldOrg.name === proposedOrgName)) {
      setValidationMsg(OrgOverlayValidationError.NameConflictError)
      setCreateOrgButtonStatus(ComponentStatus.Disabled)
    } else {
      setValidationMsg(OrgOverlayValidationError.None)
      setCreateOrgButtonStatus(ComponentStatus.Default)
    }
  }

  return (
    <Overlay.Container
      maxWidth={800}
      className="create-org-overlay--container"
      testID="create-org-overlay--container"
    >
      <Overlay.Header
        testID="create-org-overlay--header"
        title="Create an Organization"
        onDismiss={onClose}
      />
      <SpinnerContainer
        spinnerComponent={<TechnoSpinner />}
        loading={loadingState}
        className="create-org-overlay--loading-spinner"
      >
        <Overlay.Body className="create-org-overlay--body">
          {networkErrorMsg !== OrgOverlayNetworkError.None && (
            <Alert
              className="create-org-overlay--network-alert"
              color={ComponentColor.Danger}
              icon={IconFont.AlertTriangle}
            >
              {networkErrorMsg}
            </Alert>
          )}
          <CreateOrgInput
            orgName={newOrgName}
            handleValidateOrgName={handleValidateOrgName}
            validationMsg={validationMsg}
          />
          <FlexBox
            alignItems={AlignItems.FlexStart}
            className="create-org-overlay--provider-and-region-chooser"
            direction={FlexDirection.Column}
            justifyContent={JustifyContent.Center}
            margin={ComponentSize.Large}
            stretchToFitWidth={true}
          >
            <Form.Element
              className="create-org-overlay--org-name"
              htmlFor="Organization Name"
              label="Organization Name"
            >
              <Form.HelpText
                className="create-org-overlay--help-text"
                text={providerHelpText}
              />
            </Form.Element>
            <ProviderCards
              providerMap={providerMap}
              currentProvider={currentProvider}
              handleSelectProvider={handleSelectProvider}
            />
            <RegionDropdown
              regions={providerMap[currentProvider]}
              currentRegion={currentRegion}
              setCurrentRegion={setCurrentRegion}
            />
            <div className="create-org-overlay--region-info">
              <Form.HelpText text="Don't see the region you need?"></Form.HelpText>{' '}
              <SafeBlankLink href="https://www.influxdata.com/influxdb-cloud-2-0-provider-region/">
                Let us know.
              </SafeBlankLink>
            </div>
          </FlexBox>
        </Overlay.Body>{' '}
      </SpinnerContainer>
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
