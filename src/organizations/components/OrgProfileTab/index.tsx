// Libraries
import React, {FC, useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {
  AlignItems,
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ConfirmationButton,
  FlexBox,
  FlexDirection,
  IconFont,
  JustifyContent,
} from '@influxdata/clockface'
import LabeledData from 'src/organizations/components/OrgProfileTab/LabeledData'
import CopyableLabeledData from 'src/organizations/components/OrgProfileTab/CopyableLabeledData'
import {DeletePanel} from 'src/organizations/components/OrgProfileTab/DeletePanel'

// Notifications
import {orgDetailsFetchError} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

// Providers
import {UsersContext, UsersProvider} from 'src/users/context/users'

// Selectors
import {getMe} from 'src/me/selectors'
import {getOrg} from 'src/organizations/selectors'
import {selectCurrentOrg} from 'src/identity/selectors'

// Thunks
import {getCurrentOrgDetailsThunk} from 'src/identity/actions/thunks'

// Types
import {RemoteDataState} from 'src/types'

// Constants
import {CLOUD, CLOUD_URL} from 'src/shared/constants'

// Styles
import 'src/organizations/components/OrgProfileTab/style.scss'

const OrgProfileTab: FC = () => {
  const me = useSelector(getMe)
  const org = useSelector(getOrg)
  const quartzOrg = useSelector(selectCurrentOrg)
  const dispatch = useDispatch()

  // Data about the user's organization is intentionally re-fetched when this component mounts again.
  const [orgDetailsStatus, setOrgDetailsStatus] = useState(
    RemoteDataState.NotStarted
  )

  const orgDetailsLoaded = orgDetailsStatus === RemoteDataState.Done

  useEffect(() => {
    if (!CLOUD) {
      return
    }

    const retrieveOrgDetails = async () => {
      if (orgDetailsStatus === RemoteDataState.NotStarted) {
        try {
          await Promise.resolve(
            dispatch(getCurrentOrgDetailsThunk(quartzOrg.id))
          )
          setOrgDetailsStatus(RemoteDataState.Done)
        } catch (err) {
          setOrgDetailsStatus(RemoteDataState.Error)
          dispatch(notify(orgDetailsFetchError()))
        }
      }
    }

    retrieveOrgDetails()
  }, [dispatch, orgDetailsStatus, quartzOrg.id])

  const hasFetchedOrgDetails = orgDetailsStatus === RemoteDataState.Done

  const OrgProfile = () => (
    <FlexBox.Child
      className="org-profile-tab--section"
      testID="org-profile--panel"
    >
      <h4>Organization Profile</h4>
      <CopyableLabeledData
        id="orgName"
        label="Name"
        src={org.name}
        isRenameableOrg={true}
      />
      {CLOUD && hasFetchedOrgDetails && (
        <>
          <FlexBox
            className="org-profile-tab--details"
            direction={FlexDirection.Row}
            margin={ComponentSize.Medium}
            justifyContent={JustifyContent.SpaceBetween}
            stretchToFitWidth={true}
            testID="org-profile--labeled-data"
          >
            <LabeledData label="Cloud Provider" src={quartzOrg.provider} />
            <LabeledData label="Region" src={quartzOrg.regionCode} />
            <LabeledData label="Location" src={quartzOrg.regionName} />
          </FlexBox>
          <CopyableLabeledData
            id="clusterUrl"
            label="Cluster URL (Host Name)"
            src={quartzOrg.clusterHost}
          />
        </>
      )}
    </FlexBox.Child>
  )

  const CommonIds = () => (
    <FlexBox.Child
      className="org-profile-tab--section"
      testID="common-ids--panel"
    >
      <h4>Common IDs</h4>
      <CopyableLabeledData
        id="userid"
        label="User ID"
        src={me.id}
        name={me.name}
      />
      <CopyableLabeledData
        id="orgid"
        label="Organization ID"
        src={org.id}
        name={org.name}
      />
    </FlexBox.Child>
  )

  const LeaveOrgButton = () => {
    const currentUserId = me.id
    const {users, handleRemoveUser} = useContext(UsersContext)

    const allowSelfRemoval = users.length > 1

    const handleRemove = () => {
      handleRemoveUser(currentUserId)
      window.location.href = CLOUD_URL
    }

    return (
      <>
        {allowSelfRemoval && (
          <FlexBox.Child>
            <h4>Leave Organization</h4>
            <p className="org-profile-tab--heading org-profile-tab--deleteHeading">
              Leave the <b>{org.name}</b> organization.
            </p>
            <ConfirmationButton
              className="org-profile-tab--leaveOrgButton"
              confirmationLabel="This action will remove yourself from accessing this organization"
              confirmationButtonText="Leave Organization"
              titleText="Leave Organization"
              text="Leave Organization"
              confirmationButtonColor={ComponentColor.Danger}
              color={ComponentColor.Default}
              shape={ButtonShape.Square}
              onConfirm={handleRemove}
              testID="delete-user"
              icon={IconFont.Logout}
            />
          </FlexBox.Child>
        )}
      </>
    )
  }

  return (
    <FlexBox
      direction={FlexDirection.Column}
      alignItems={AlignItems.FlexStart}
      testID="organization-profile--panel"
      margin={ComponentSize.Large}
    >
      <FlexBox
        direction={FlexDirection.Row}
        stretchToFitWidth={true}
        style={{flexWrap: 'wrap'}}
      >
        <OrgProfile />
        <CommonIds />
      </FlexBox>

      {CLOUD && orgDetailsLoaded && (
        <FlexBox
          direction={FlexDirection.Row}
          stretchToFitWidth={true}
          className="org-profile-tab--section"
        >
          <UsersProvider>
            <>
              <DeletePanel />
              <LeaveOrgButton />
            </>
          </UsersProvider>
        </FlexBox>
      )}
    </FlexBox>
  )
}

export default OrgProfileTab
