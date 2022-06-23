import React, {useContext, useEffect, useState} from 'react'
import {ComponentSize, FlexBox, Icon, IconFont, JustifyContent, SelectDropdown} from '@influxdata/clockface'
import {UserAccountContext} from '../../../accounts/context/userAccount'
import {useSelector} from 'react-redux'
import {AppState, ResourceType} from '../../../types'

const globalHeaderStyle = {
  padding: '0 32px 0 32px',
  margin: '24px 0 24px 0',
}


const GlobalHeader = () => {
  const {userAccounts} = useContext(UserAccountContext)
  const [selectedOption, setSelectedOption] = useState('Loading...')

  const userOrgs = useSelector((state :AppState) => state.resources[ResourceType.Orgs])
  console.log(userOrgs)
  const options = userAccounts?.map(acct => acct.name) || []

  useEffect(() => {
    const initialPick = userAccounts?.filter(acct => acct.isActive)[0].name
    setSelectedOption(initialPick)
  }, [userAccounts])

    return (
      <FlexBox
        margin={ComponentSize.Large}
        justifyContent={JustifyContent.SpaceBetween}
        style={globalHeaderStyle}
      >
        <FlexBox margin={ComponentSize.Medium}>
          <SelectDropdown selectedOption={selectedOption} options={options} onSelect={setSelectedOption} />
          <Icon glyph={IconFont.CaretRight}></Icon>
          <div>Org Dropdown</div>
        </FlexBox>
        <div>User Icon</div>
      </FlexBox>
    )
}

export default GlobalHeader
