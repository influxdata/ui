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
  OrgCreationSuccess = 'headerNav.orgDropdown.createOrgsuccess',
  OrgCreationFail = 'headerNav.orgDropdown.createOrgfail',
  SwitchToNewOrg = 'headerNav.createOrganization.switchToNewOrgClicked',
}

export enum DeleteOrgOverlay {
  DeleteOrgFail = 'userProfile.orgsTab.deleteOrgFailed',
  DeleteOrgSuccess = 'userProfile.orgsTab.deleteOrgSuccess',
}

export enum AccountUpgradeOverlay {
  MarketoAccountUpgradeFail = 'userProfile.marketoAccountUpgradeForm.submitFail',
  MarketoAccountUpgradeSuccess = 'userProfile.marketoAccountUpgradeForm.submitSuccess',
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
