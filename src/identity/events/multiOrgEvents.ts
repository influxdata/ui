import {event} from 'src/cloud/utils/reporting'
import {Dispatch} from 'redux'
import {GetState} from 'src/types'
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
  AccountSwitch = 'headerNav.accountDropdown.switchAccount',
  AccountDropdownClick = 'headerNav.accountDropdown.clicked',
  OrgSwitch = 'headerNav.orgDropdown.switchOrg',
  OrgDropdownClick = 'headerNav.orgDropdown.clicked',
  UserAvatarClick = 'headerNav.userAvatarIcon.clicked',
  UserProfileClick = 'headerNav.userAvatarProfile.clicked',
  UserLogoutClick = 'headerNav.userAvatarLogOut.clicked',
}

export enum UserProfileEvent {
  DefaultAccountChange = 'userProfile.defaultAccountDropdown.accountChanged',
  DefaultOrgChange = 'userProfile.defaultOrgDropdown.orgChanged',
}

export const UserProfileEventPrefix = 'userProfile.default'

export enum MainMenuEvent {
  SwitchOrg = 'headerNav.org',
  SwitchAccount = 'headerNav.account',
  ChangeDefaultOrg = 'userProfile.defaultOrgDropdown',
  ChangDefaultAccount = 'userProfile.defaultAccountDropdown',
}

export enum TypeAheadEventPrefix {
  HeaderNavSearchAccount = 'headerNav.searchAccounts',
  HeaderNavSearchOrg = 'headerNav.searchOrgs',
  UserProfileSearchAccount = 'userProfile.defaultAccount',
  UserProfileSearchOrg = 'userProfile.defaultOrg',
}
