// Libraries
import React, {FC, useCallback, useContext, useState} from 'react'
import {useDispatch} from 'react-redux'
import {
  Button,
  ComponentColor,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  Overlay,
} from '@influxdata/clockface'

// Components
import {OverlayContext} from 'src/overlays/components/OverlayController'
import {InputWithLabel} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/InputWithLabel'
import {ProviderChooser} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/ProviderChooser'

// Styles
import './CreateOrganizationOverlay.scss'
import {
  CreateOrgProvider,
  CreateOrgContext,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/CreateOrganizationContext'

// Types
import {RemoteDataState} from 'src/types'
import {notify} from 'src/shared/actions/notifications'
import {orgCreateSuccess} from 'src/shared/copy/notifications'

const DEFAULT_ERROR_MESSAGE = 'This is a required field'
const NAME_CONFLICT_MESSAGE =
  'This organization name already exists. Please choose a different name.'

const CreateOrgOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const {orgName, changeOrgName, createOrg, createOrgLoadingStatus} =
    useContext(CreateOrgContext)
  const dispatch = useDispatch()
  const [errorMessage, setErrorMessage] = useState(DEFAULT_ERROR_MESSAGE)
  const [showError, setShowError] = useState(false)

  const handleOrgNameChange = useCallback(
    e => {
      changeOrgName(e.target.value)
      setShowError(false)
      setErrorMessage(DEFAULT_ERROR_MESSAGE)
    },
    [changeOrgName]
  )

  const handleCreateOrg = useCallback(() => {
    if (orgName.trim() === '') {
      setShowError(true)
      setErrorMessage(DEFAULT_ERROR_MESSAGE)
      return
    }

    createOrg()
      .then(() => {
        onClose()
        dispatch(notify(orgCreateSuccess()))
      })
      .catch(_ => {
        setShowError(true)
        setErrorMessage(NAME_CONFLICT_MESSAGE)
      })
  }, [createOrg, dispatch, onClose, orgName, setShowError, setErrorMessage])

  return (
    <Overlay.Container
      maxWidth={750}
      className="create-org-overlay-container"
      testID="create-org-overlay--container"
    >
      <Overlay.Header
        testID="create-org-overlay-header"
        title="Create an Organization"
        onDismiss={onClose}
      />
      <Overlay.Body>
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
            errorMessage={errorMessage}
            showError={showError}
          />
          <ProviderChooser />
        </FlexBox>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="Cancel"
          testID="create-org-form-cancel"
          color={ComponentColor.Default}
          status={
            createOrgLoadingStatus === RemoteDataState.Loading
              ? ComponentStatus.Disabled
              : ComponentStatus.Default
          }
          onClick={onClose}
        />
        <Button
          text="Create Organization"
          testID="create-org-form-submit"
          color={ComponentColor.Primary}
          status={
            createOrgLoadingStatus === RemoteDataState.Loading
              ? ComponentStatus.Loading
              : ComponentStatus.Default
          }
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
