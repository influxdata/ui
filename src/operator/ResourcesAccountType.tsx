import {
  ComponentColor,
  DropdownMenuTheme,
  MultiSelectDropdown,
} from '@influxdata/clockface'
import React, {FC, useContext} from 'react'
import {OperatorContext} from './context/operator'
import {AccountType} from 'src/types'

const allAccountTypes: AccountType[] = [
  'cancelled',
  'contract',
  'free',
  'pay_as_you_go',
]

const ResourcesAccountType: FC = () => {
  const {accountTypes, setAccountTypes} = useContext(OperatorContext)

  const handleSelect = (selectedOption: AccountType): void =>
    accountTypes.includes(selectedOption)
      ? setAccountTypes(prev => prev.filter(x => x !== selectedOption))
      : setAccountTypes(prev => [selectedOption, ...prev])

  return (
    <MultiSelectDropdown
      style={{width: '220px', marginRight: '20px'}}
      options={allAccountTypes}
      selectedOptions={accountTypes}
      onSelect={(value: AccountType) => handleSelect(value)}
      menuTheme={DropdownMenuTheme.Onyx}
      emptyText="Account Types"
      buttonColor={ComponentColor.Primary}
    />
  )
}

export default ResourcesAccountType
