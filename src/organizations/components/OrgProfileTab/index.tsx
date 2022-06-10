// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

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
import {getOrg} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

// Types
import {getMe} from 'src/me/selectors'

import 'src/organizations/components/OrgProfileTab/style.scss'

const OrgProfileTab: FC = () => {
  const me = useSelector(getMe)
  const org = useSelector(getOrg)

  const expectQuartzData = CLOUD && isFlagEnabled('uiUnificationFlag')

  const hasSomeQuartzOrgData =
    me.quartzMe?.billingProvider ||
    me.quartzMe?.regionCode ||
    me.quartzMe?.regionName

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
      {expectQuartzData && hasSomeQuartzOrgData && (
        <>
          <FlexBox
            direction={FlexDirection.Row}
            margin={ComponentSize.Medium}
            justifyContent={JustifyContent.SpaceBetween}
            stretchToFitWidth={true}
            style={{width: '85%'}}
          >
            {me.quartzMe?.billingProvider && (
              <LabeledData label="Provider" src={me.quartzMe.billingProvider} />
            )}
            {me.quartzMe?.regionCode && (
              <LabeledData label="Region" src={me.quartzMe.regionCode} />
            )}
            {me.quartzMe?.regionName && (
              <LabeledData label="Location" src={me.quartzMe.regionName} />
            )}
          </FlexBox>
          {expectQuartzData && me.quartzMe?.clusterHost && (
            <CopyableLabeledData
              id="clusterUrl"
              label="Cluster URL (Host Name)"
              src={me.quartzMe.clusterHost}
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

      {expectQuartzData && (
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
