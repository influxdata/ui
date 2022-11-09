// Libraries
import React, {FC, useCallback, useContext, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import {
  Alert,
  Button,
  ComponentColor,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  IconFont,
  Overlay,
} from '@influxdata/clockface'

// Components
import {InputWithLabel} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/InputWithLabel'
import {OverlayContext} from 'src/overlays/components/OverlayController'
import {ProviderChooser} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderChooser'

// Styles
import './CreateOrganizationOverlay.scss'

// Contexts
import {
  CreateOrgProvider,
  CreateOrgContext,
  CreateOrgError,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/CreateOrganizationContext'

// Types
import {RemoteDataState} from 'src/types'
import {notify} from 'src/shared/actions/notifications'
import {orgCreateSuccess} from 'src/shared/copy/notifications'
import {
  ServerError,
  UnauthorizedError,
  UnprocessableEntityError,
} from 'src/types/error'

const DEFAULT_ERROR_MESSAGE = 'This is a required field'
const NAME_CONFLICT_MESSAGE =
  'This organization name already exists. Please choose a different name.'
const errorStyle = {
  margin: '20px 0',
}

const errorMap = {
  [CreateOrgError.ServerError]: 'Organization creation failed.',
  [CreateOrgError.NameConflict]: NAME_CONFLICT_MESSAGE,
  [CreateOrgError.Unauthorized]: 'Not authorized to create organization.',
  [CreateOrgError.ClustersFetchError]: 'Error fetching cluster information.',
  [CreateOrgError.GenericError]:
    'Error creating organization. Please refresh and try again in some time.',
}
const CreateOrgOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const {
    clusters,
    orgName,
    changeOrgName,
    createOrg,
    createOrgLoadingStatus,
    error,
    changeCreateOrgLoadingStatus,
    setError,
  } = useContext(CreateOrgContext)
  const dispatch = useDispatch()
  const [inputError, setInputError] = useState(DEFAULT_ERROR_MESSAGE)
  const [errorMessage, setErrorMessage] = useState(null)
  const [showError, setShowError] = useState(false)

  const handleOrgNameChange = useCallback(
    e => {
      changeOrgName(e.target.value)
      setShowError(false)
      setInputError(DEFAULT_ERROR_MESSAGE)
    },
    [changeOrgName]
  )

  useEffect(() => {
    if (createOrgLoadingStatus === RemoteDataState.Error) {
      if (error === CreateOrgError.NameConflict) {
        setShowError(true)
        setInputError(NAME_CONFLICT_MESSAGE)
      } else {
        setErrorMessage(errorMap?.[error])
      }
    } else {
      setShowError(false)
    }
  }, [error, createOrgLoadingStatus])

  const handleCreateOrg = useCallback(() => {
    if (orgName.trim() === '') {
      setShowError(true)
      setInputError(DEFAULT_ERROR_MESSAGE)
      return
    }

    createOrg()
      .then(() => {
        onClose()
        dispatch(notify(orgCreateSuccess()))
      })
      .catch(err => {
        if (err instanceof UnauthorizedError) {
          setError(CreateOrgError.Unauthorized)
        } else if (err instanceof ServerError) {
          setError(CreateOrgError.ServerError)
        } else if (err instanceof UnprocessableEntityError) {
          /*
          Quartz responds with a 422 status code if the user-selected org name is a duplicate of an
          org name in the current account. It may also respond with a 422 for other reasons.

          However, the UI will interpret the 422 as an org name duplicate for purposes of user feedback,
          since a 422 generated for other reasons is very unlikely, and still means that the user cannot
          create an organization using the current input values anyway.'
          */
          setError(CreateOrgError.NameConflict)
        } else {
          setError(CreateOrgError.GenericError)
        }
        changeCreateOrgLoadingStatus(RemoteDataState.Error)
      })
  }, [
    orgName,
    createOrg,
    onClose,
    dispatch,
    changeCreateOrgLoadingStatus,
    setError,
  ])

  const hasClusters = !!Object.keys(clusters).length
  const cancelButtonStatusMap = {
    [RemoteDataState.Loading]: ComponentStatus.Disabled,
    [RemoteDataState.Error]: ComponentStatus.Default,
    [RemoteDataState.Done]: ComponentStatus.Default,
    [RemoteDataState.NotStarted]: ComponentStatus.Default,
  }
  const createButtonStatusMap = {
    [RemoteDataState.Loading]: ComponentStatus.Loading,
    [RemoteDataState.Error]: ComponentStatus.Disabled,
    [RemoteDataState.Done]: ComponentStatus.Default,
    [RemoteDataState.NotStarted]:
      orgName === '' ? ComponentStatus.Disabled : ComponentStatus.Default,
  }
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
        {errorMessage && (
          <Alert
            style={errorStyle}
            color={ComponentColor.Danger}
            icon={IconFont.AlertTriangle}
          >
            {errorMessage}
          </Alert>
        )}
        <FlexBox
          direction={FlexDirection.Column}
          className="create-org-overlay-body"
        >
          <InputWithLabel
            value={orgName}
            required={true}
            label="Organization Name"
            onChange={handleOrgNameChange}
            placeholder="Dev Team, US Eastern Region, Staging"
            description="You may want to create separate organizations for each team, server region, or dev environment."
            errorMessage={inputError}
            showError={showError}
            status={
              hasClusters ? ComponentStatus.Default : ComponentStatus.Disabled
            }
          />
          <ProviderChooser />
        </FlexBox>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="Cancel"
          testID="create-org-form-cancel"
          color={ComponentColor.Default}
          status={cancelButtonStatusMap[createOrgLoadingStatus]}
          onClick={onClose}
        />
        <Button
          text="Create Organization"
          testID="create-org-form-submit"
          color={ComponentColor.Primary}
          status={createButtonStatusMap[createOrgLoadingStatus]}
          onClick={handleCreateOrg}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export const CreateOrganizationOverlay = () => (
  <CreateOrgProvider>
    <CreateOrgOverlay />
  </CreateOrgProvider>
)
