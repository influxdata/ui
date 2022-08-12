// Libraries
import React, {FC, SetStateAction} from 'react'
import {
  AlignItems,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  FontWeight,
  Heading,
  HeadingElement,
  JustifyContent,
} from '@influxdata/clockface'

// Components
import {
  DefaultDropdown,
  EntityLabel,
} from 'src/identity/components/userprofile/DefaultDropdown'
import {UserProfileInput} from 'src/identity/components/userprofile/UserProfileInput'

// Types
import {CurrentAccount} from 'src/identity/apis/auth'
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'

interface Props {
  accounts: UserAccount[]
  loggedInAccount: CurrentAccount
  orgs: OrganizationSummaries
  selectedOrg: OrganizationSummaries[number]
  setSelectedOrg: (action: SetStateAction<any>) => void
}

export const DefaultOrgForm: FC<Props> = ({
  accounts,
  loggedInAccount,
  orgs,
  selectedOrg,
  setSelectedOrg,
}) => {
  return (
    <>
      <FlexBox
        direction={FlexDirection.Column}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
      >
        <Heading
          weight={FontWeight.Bold}
          element={HeadingElement.H4}
          className="change-default-account-org--header"
          testID="user-defaults-change-org--header"
        >
          Default Organization
        </Heading>
        <div className="change-default-account-org--text">
          Select the organization you want to see by default when logging into
          your current account
        </div>
      </FlexBox>

      <FlexBox
        direction={FlexDirection.Row}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
      >
        {accounts && (
          <UserProfileInput
            status={ComponentStatus.Disabled}
            header="Account"
            text={loggedInAccount.name}
            testID="user-profile--current-account-header"
            inputTestID="user-profile--current-account-input"
          />
        )}
        {orgs && (
          <DefaultDropdown
            entityLabel={EntityLabel.DefaultOrg}
            defaultEntity={selectedOrg}
            entityList={orgs}
            changeSelectedEntity={setSelectedOrg}
            headerTestID="user-profile--default-org-header"
            defaultTestID="user-profile--default-org-dropdown"
          />
        )}
      </FlexBox>
    </>
  )
}
