export const multiOrgTag = {
  initiative: 'multiOrg',
}

export enum AccountUpgradeOverlay {
  MarketoAccountUpgrade = 'userProfile.marketoAccountUpgrade.formSubmitted',
  SalesFormLinkClick = 'userProfile.marketoAccountUpgrade.salesFormLinkClicked',
}

export enum CreateOrgOverlayEvent {
  OrgCreated = 'headerNav.createOrgOverlay.orgCreated',
  SwitchToNewOrg = 'headerNav.createOrgOverlay.switchedToNewOrg',
}

export enum DeleteOrgOverlay {
  DeleteOrg = 'userProfile.orgProfileTab.orgDeleted',
}

export enum HeaderNavEvent {
  AccountDropdownClick = 'headerNav.accountDropdown.clicked',
  AccountSwitch = 'headerNav.accountDropdown.accountSwitched',

  CreateOrgClick = 'headerNav.createOrg.clicked',
  OrgDropdownClick = 'headerNav.orgDropdown.clicked',
  OrgSwitch = 'headerNav.orgDropdown.orgSwitched',

  UpgradeButtonClick = 'headerNav.upgradeButton.clicked',
  UserAvatarClick = 'headerNav.userAvatarIcon.clicked',
  UserProfileClick = 'headerNav.userAvatarProfile.clicked',
  UserLogoutClick = 'headerNav.userAvatarLogOut.clicked',
}

export enum MainMenuEventPrefix {
  ChangeDefaultAccount = 'userProfile.defaultAccountDropdown',
  ChangeDefaultOrg = 'userProfile.defaultOrgDropdown',
  SwitchOrg = 'headerNav.org',
  SwitchAccount = 'headerNav.account',
}

export enum OrgListEvent {
  UpgradeAccount = 'accountSettings.orgsTab.upgradeBannerClicked',
}

export enum TypeAheadEventPrefix {
  HeaderNavSearchAccount = 'headerNav.searchAccounts',
  HeaderNavSearchOrg = 'headerNav.searchOrgs',

  UserProfileSearchAccount = 'userProfile.defaultAccountDropdown',
  UserProfileSearchOrg = 'userProfile.defaultOrgDropdown',
}

export enum UserProfileEvent {
  DefaultAccountChange = 'userProfile.defaultAccountDropdown.defaultAccountChanged',
  DefaultOrgChange = 'userProfile.defaultOrgDropdown.defaultOrgChanged',
}

export enum UserProfileEventPrefix {
  Account = 'Account',
  Default = 'userProfile.default',
  Organization = 'Org',
}
