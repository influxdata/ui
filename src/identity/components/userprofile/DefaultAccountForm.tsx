// Libraries
import React, {FC, SetStateAction} from 'react'
import {
  AlignItems,
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

// Types
import {UserAccount} from 'src/client/unityRoutes'

interface Props {
  accounts: UserAccount[]
  selectedAccount: UserAccount
  setSelectedAccount: (action: SetStateAction<any>) => void
}

export const DefaultAccountForm: FC<Props> = ({
  accounts,
  selectedAccount,
  setSelectedAccount,
}) => {
  return (
    <FlexBox
      direction={FlexDirection.Column}
      alignItems={AlignItems.FlexStart}
      justifyContent={JustifyContent.FlexStart}
    >
      <Heading
        weight={FontWeight.Bold}
        element={HeadingElement.H4}
        className="change-default-account-org--header"
        testID="user-profile--change-account-header"
      >
        Default Account
      </Heading>
      <div className="change-default-account-org--text">
        Select the account you want to see when you first log in
      </div>
      {accounts && (
        <DefaultDropdown
          entityLabel={EntityLabel.DefaultAccount}
          defaultEntity={selectedAccount}
          entityList={accounts}
          changeSelectedEntity={setSelectedAccount}
          headerTestID="user-profile--change-account-dropdown-header"
          defaultTestID="user-profile--change-account-dropdown"
        />
      )}
    </FlexBox>
  )
}
