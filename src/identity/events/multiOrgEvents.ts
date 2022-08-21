import {event} from 'src/cloud/utils/reporting'
import {PointFields, PointTags} from 'src/cloud/apis/reporting'

export const multiOrgEvent = (eventName: string, fields?: PointFields) => {
  const tags: PointTags = {
    initiative: 'multiOrg',
  }
  event(eventName, tags, fields)
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

export enum UserProfileEventPrefix {
  Default = 'userProfile.default',
  Account = 'Account',
  Organization = 'Org',
}

export enum MainMenuEventPrefix {
  SwitchOrg = 'headerNav.org',
  SwitchAccount = 'headerNav.account',

  ChangeDefaultOrg = 'userProfile.defaultOrgDropdown',
  ChangeDefaultAccount = 'userProfile.defaultAccountDropdown',
}

export enum TypeAheadEventPrefix {
  HeaderNavSearchAccount = 'headerNav.searchAccounts',
  HeaderNavSearchOrg = 'headerNav.searchOrgs',

  UserProfileSearchAccount = 'userProfile.defaultAccountDropdown',
  UserProfileSearchOrg = 'userProfile.defaultOrgDropdown',
}
