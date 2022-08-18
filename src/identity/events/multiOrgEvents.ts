import {event} from 'src/cloud/utils/reporting'
import {PointFields, PointTags} from 'src/cloud/apis/reporting'

export const multiOrgEvent = (name: string, fields?: PointFields) => {
  const tags: PointTags = {
    initiative: 'multiOrg',
  }
  event(name, tags, fields)
}

export enum HeaderNavEvent {
  HeaderNavAccountSwitch = 'headerNav.account.switched', // ideally this would be headerNav.accountDropdown.accountSwitched
  HeaderNavAccountDropdownClick = 'headerNav.accountDropdown.clicked',
  HeaderNavOrgSwitch = 'headerNav.org.switched', // ideally this would be headerNav.orgDropdown.orgSwitched
  HeaderNavOrgDropdownClick = 'headerNav.orgDropdown.clicked',
  HeaderNavUserAvatarClick = 'headerNav.userAvatarIcon.clicked',
  HeaderNavUserProfileClick = 'headerNav.userAvatarProfile.clicked',
  HeaderNavUserLogoutClick = 'headerNav.userAvatarLogOut.clicked',
}

export enum UserProfileEvent {
  DefaultAccountChange = 'userProfile.defaultAccount.changed',
  DefaultOrgChange = 'userProfile.defaultOrg.changed',
}

export const UserProfileEventPrefix = 'userProfile.default'

export enum MainMenuEventPrefix {
  HeaderNavChangeOrg = 'headerNav.org',
  HeaderNavChangeAccount = 'headerNav.account',
  UserProfileChangeDefaultOrg = 'userProfile.defaultOrg',
  UserProfileChangeDefaultAccount = 'userProfile.defaultAccount',
}

export enum TypeAheadEventPrefix {
  HeaderNavSearchAccount = 'headerNav.searchAccounts',
  HeaderNavSearchOrg = 'headerNav.searchOrgs',
  UserProfileSearchAccount = 'userProfile.defaultAccount',
  UserProfileSearchOrg = 'userProfile.defaultOrg',
}
