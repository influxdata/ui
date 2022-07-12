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
// import {UserAccount} from 'src/client/unityRoutes'

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
      style={{
        marginLeft: '0px',
        marginRight: '20px',
      }}
    >
      <Heading
        className="org-profile-tab--heading"
        element={HeadingElement.H5}
        weight={FontWeight.Medium}
      >
        {label}
      </Heading>
      <TypeAheadDropDown
        selectedOption={defaultAccount}
        items={accountList}
        onSelect={changeSelectedAccount}
        placeholderText="Select a Default Account"
        style={{width: '250px'}}
      />
    </FlexBox>
  )
}
