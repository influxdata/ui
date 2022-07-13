import React, {FC} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  FontWeight,
  Heading,
  HeadingElement,
  TypeAheadDropDown,
} from '@influxdata/clockface'

// Style
import 'src/identity/components/userprofile/UserProfile.scss'

interface Props {
  label: string
  defaultAccount
  accountList
  changeSelectedAccount /* : React.Dispatch<React.SetStateAction<UserAccount>> */
}

export const DefaultAccountDropDown: FC<Props> = ({
  label,
  defaultAccount,
  accountList,
  changeSelectedAccount,
}) => {
  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      className="change-account-org-dropdown--container"
    >
      <Heading
        element={HeadingElement.H5}
        weight={FontWeight.Medium}
        className="change-account-org-dropdown--header"
      >
        {label}
      </Heading>
      <TypeAheadDropDown
        selectedOption={defaultAccount}
        items={accountList}
        onSelect={changeSelectedAccount}
        placeholderText="Select a Default Account"
        className="change-account-org--typeahead"
      />
    </FlexBox>
  )
}
