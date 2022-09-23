// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import {
  FlexBox,
  AlignItems,
  FlexDirection,
  ComponentSize,
  JustifyContent,
} from '@influxdata/clockface'
import UsersProvider from 'src/users/context/users'
import LabeledData from 'src/organizations/components/OrgProfileTab/LabeledData'
import CopyableLabeledData from 'src/organizations/components/OrgProfileTab/CopyableLabeledData'
import DeletePanel from 'src/organizations/components/OrgProfileTab/DeletePanel'

// Utils
import {CLOUD} from 'src/shared/constants'

// Selectors
import {getMe} from 'src/me/selectors'
import {getOrg} from 'src/organizations/selectors'
import {selectCurrentIdentity} from 'src/identity/selectors'

// Thunks
import {getCurrentOrgDetailsThunk} from 'src/identity/actions/thunks'

// Styles
import 'src/organizations/components/OrgProfileTab/style.scss'

const OrgProfileTab: FC = () => {
  const me = useSelector(getMe)
  const org = useSelector(getOrg)
  const currentIdentity = useSelector(selectCurrentIdentity)
  const {org: quartzOrg} = currentIdentity

  const dispatch = useDispatch()

  const identityOrgId = identity.currentIdentity.org.id

  useEffect(() => {
    if (identityOrgId && CLOUD) {
      if (quartzOrg.regionCode || quartzOrg.regionName || quartzOrg.provider) {
        dispatch(getCurrentOrgDetailsThunk(identityOrgId))
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const hasIdentityData =
    quartzOrg.provider || quartzOrg.regionCode || quartzOrg.regionName

  const orgProviderExists = !!quartzOrg.provider

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
      {CLOUD && hasIdentityData && (
        <>
          <FlexBox
            direction={FlexDirection.Row}
            margin={ComponentSize.Medium}
            justifyContent={JustifyContent.SpaceBetween}
            stretchToFitWidth={true}
            style={orgProviderExists ? {width: '85%'} : {width: '48%'}}
          >
            {orgProviderExists && (
              <LabeledData label="Cloud Provider" src={quartzOrg.provider} />
            )}
            {quartzOrg.regionCode && (
              <LabeledData label="Region" src={quartzOrg.regionCode} />
            )}
            {quartzOrg.regionName && (
              <LabeledData label="Location" src={quartzOrg.regionName} />
            )}
          </FlexBox>
          {CLOUD && quartzOrg.clusterHost && (
            <CopyableLabeledData
              id="clusterUrl"
              label="Cluster URL (Host Name)"
              src={quartzOrg.clusterHost}
            />
          )}
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

      {CLOUD && (
        <FlexBox.Child className="org-profile-tab--section">
          <UsersProvider>
            <DeletePanel />
          </UsersProvider>
        </FlexBox.Child>
      )}
    </FlexBox>
  )
}

export default OrgProfileTab
