import {
  ComponentColor,
  DropdownMenuTheme,
  MultiSelectDropdown,
} from '@influxdata/clockface'
import React, {FC, useContext} from 'react'
import {OperatorContext} from './context/operator'

const ResourcesAccountType: FC = () => {
  const {accountTypes, setAccountTypes} = useContext(OperatorContext)
  const availableTypes: string[] = allAccountTypes

  const handleSelect = (selectedOption: string): void =>
    accountTypes.includes(selectedOption)
      ? setAccountTypes(accountTypes.filter(x => x !== selectedOption))
      : setAccountTypes([selectedOption, ...accountTypes])

  return (
    <MultiSelectDropdown
      style={{width: '220px'}}
      options={availableTypes}
      selectedOptions={accountTypes}
      onSelect={handleSelect}
      menuTheme={DropdownMenuTheme.Onyx}
      emptyText="Account Types"
      buttonColor={ComponentColor.Primary}
    />
  )
}

const allAccountTypes: string[] = [
  'cancelled',
  'contract',
  'free',
  'pay_as_you_go',
]

export default ResourcesAccountType
