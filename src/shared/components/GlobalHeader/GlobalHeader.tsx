import React, {useContext, useEffect, useState} from 'react'
import {ComponentSize, FlexBox, Icon, IconFont, JustifyContent, SelectDropdown} from '@influxdata/clockface'
import {UserAccountContext} from '../../../accounts/context/userAccount'
import {useSelector} from 'react-redux'
import {AppState, ResourceType} from '../../../types'
import {MenuDropdown, SubMenuItem} from '@influxdata/clockface'

const globalHeaderStyle = {
  padding: '0 32px 0 32px',
  margin: '24px 0 24px 0',
}


const GlobalHeader = () => {
  const {userAccounts} = useContext(UserAccountContext)
  const [selectedOption, setSelectedOption] = useState({name: 'Loading...' , id : ''} as SubMenuItem)

  const options = userAccounts?.map(acct => {return {name: acct.name, id: acct.id.toString()} as SubMenuItem}) || []

  console.log(userAccounts)
  useEffect(() => {
    const initialPick = userAccounts?.filter(acct => acct.isActive)[0]
    setSelectedOption({name: initialPick?.name, id: initialPick?.id.toString()})
  }, [userAccounts])

  const menuHrefOptions = [
    {
      name: 'Settings',
      iconFont: IconFont.CogOutline,
      href: '/settings',
    },
    {
      name: 'Members',
      iconFont: IconFont.UserOutline_New,
      href: '/members',
    },
    {
      name: 'Billing',
      iconFont: IconFont.Bill,
      href: '/billing',
    },
  ]


  const accountDropdown = <MenuDropdown
    largeListSearch={true}
    largeListCeiling={15}
    selectedOption={selectedOption}
    options={menuHrefOptions}
    subMenuOptions={options}
    menuHeaderIcon={IconFont.Switch_New}
    menuHeaderText={'Switch Account'}
    style={{width: '110px'}}
    menuStyle={{width: '250px'}}
  />

    return (
      <FlexBox
        margin={ComponentSize.Large}
        justifyContent={JustifyContent.SpaceBetween}
        style={globalHeaderStyle}
      >
        <FlexBox margin={ComponentSize.Medium}>

          {accountDropdown}
          <Icon glyph={IconFont.CaretRight}></Icon>
          <div>Org Dropdown</div>
        </FlexBox>
        <div>User Icon</div>
      </FlexBox>
    )
}

export default GlobalHeader
