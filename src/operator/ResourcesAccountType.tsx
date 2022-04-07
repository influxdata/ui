import {
  ComponentColor,
  DropdownMenuTheme,
  MultiSelectDropdown,
} from '@influxdata/clockface'
import React, {FC, useContext} from 'react'
import {OperatorContext} from './context/operator'
import {AccountType} from 'src/types'

const ResourcesAccountType: FC = () => {
  const {accountTypes, setAccountTypes} = useContext(OperatorContext)
  const availableTypes: AccountType[] = allAccountTypes

  const handleSelect = (selectedOption: string): void =>
    accountTypes.includes(selectedOption)
      ? setAccountTypes(
          accountTypes.filter(x => x !== (selectedOption as AccountType))
        )
      : setAccountTypes([selectedOption as AccountType, ...accountTypes])

  return (
    <MultiSelectDropdown
      style={{width: '220px', marginRight: '20px'}}
      options={availableTypes}
      selectedOptions={accountTypes}
      onSelect={handleSelect}
      menuTheme={DropdownMenuTheme.Onyx}
      emptyText="Account Types"
      buttonColor={ComponentColor.Primary}
    />
  )
}

export default ResourcesAccountType

const allAccountTypes: AccountType[] = [
  'cancelled',
  'contract',
  'free',
  'pay_as_you_go',
]
