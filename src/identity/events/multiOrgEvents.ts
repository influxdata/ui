export const multiOrgTag = {
  initiative: 'multiOrg',
}

export enum HeaderNavEvent {
  AccountDropdownClick = 'headerNav.accountDropdown.clicked',
  AccountSwitch = 'headerNav.accountDropdown.accountSwitched',

  OrgDropdownClick = 'headerNav.orgDropdown.clicked',
  OrgSwitch = 'headerNav.orgDropdown.orgSwitched',

  UserAvatarClick = 'headerNav.userAvatarIcon.clicked',
  UserProfileClick = 'headerNav.userAvatarProfile.clicked',
  UserLogoutClick = 'headerNav.userAvatarLogOut.clicked',

  CreateOrgClick = 'headerNav.createOrg.clicked',
  UpgradeButtonClick = 'headerNav.upgradeButton.clicked',
}

export enum CreateOrgOverlayEvent {
  OrgCreationSuccess = 'headerNav.createOrgOverlay.creationSuccess',
  OrgCreationFail = 'headerNav.createOrgOverlay.creationFail',
  SwitchToNewOrg = 'headerNav.createOrg.switchedToNewOrg',
}

export enum DeleteOrgOverlay {
  DeleteOrgFail = 'userProfile.orgProfileTab.orgDeletionFailed',
  DeleteOrgSuccess = 'userProfile.orgProfileTab.orgDeletionSuccess',
}

export enum AccountUpgradeOverlay {
  MarketoAccountUpgradeFail = 'userProfile.marketoAccountUpgradeForm.submissionFail',
  MarketoAccountUpgradeSuccess = 'userProfile.marketoAccountUpgradeForm.submissionSuccess',
  SalesFormLinkClick = 'userProfile.marketoAccountUpgradeForm.salesFormLinkClicked',
}

export enum OrgListEvent {
  UpgradeAccount = 'accountSettings.orgsTab.upgradeBannerClicked',
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
