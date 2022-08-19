import {Dispatch} from 'redux'
import {GetState} from 'src/types'
import {event} from 'src/cloud/utils/reporting'
import {PointFields, PointTags} from 'src/cloud/apis/reporting'

export const multiOrgEvent = (eventName: string, fields?: PointFields) => (
  _dispatch: Dispatch,
  getState: GetState
) => {
  const tags: PointTags = {
    initiative: 'multiOrg',
  }

  const account = getState().identity.currentIdentity.account
  const {id: activeAccountID, name: activeAccountName} = account

  event(eventName, tags, {activeAccountID, activeAccountName, ...fields})
}

export enum HeaderNavEvent {
  AccountDropdownClick = 'headerNav.accountDropdown.clicked',
  AccountSwitch = 'headerNav.accountDropdown.accountSwitched',

  OrgDropdownClick = 'headerNav.orgDropdown.clicked',
  OrgSwitch = 'headerNav.orgDropdown.orgSwitched',

  UserAvatarClick = 'headerNav.userAvatarIcon.clicked',
  UserProfileClick = 'headerNav.userAvatarProfile.clicked',
  UserLogoutClick = 'headerNav.userAvatarLogOut.clicked',
}

export enum UserProfileEvent {
  DefaultAccountChange = 'userProfile.defaultAccountDropdown.defaultAccountChanged',
  DefaultOrgChange = 'userProfile.defaultOrgDropdown.defaultOrgChanged',
}

export const UserProfileEventPrefix = 'userProfile.default'

// Check this one
export enum MainMenuEvent {
  SwitchOrg = 'headerNav.org',
  SwitchAccount = 'headerNav.account',

  ChangeDefaultOrg = 'userProfile.defaultOrgDropdown',
  ChangDefaultAccount = 'userProfile.defaultAccountDropdown',
}

export enum TypeAheadEventPrefix {
  HeaderNavSearchAccount = 'headerNav.searchAccounts',
  HeaderNavSearchOrg = 'headerNav.searchOrgs',

  UserProfileSearchAccount = 'userProfile.defaultAccountDropdown',
  UserProfileSearchOrg = 'userProfile.defaultOrgDropdown',
}
