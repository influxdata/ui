import React from 'react'
import {CellInfo, ResourceInfo} from 'src/types/operator'
import {Link} from 'react-router-dom'

export const accountHeaderInfo = [
  'Company Name',
  'Acct ID',
  'Owner Email',
  'Users',
  'Balance',
  'Account Type',
  'Billing Provider',
]

export const accountColumnInfo: CellInfo[] = [
  {
    path: ['billingContact', 'companyName'],
    name: 'company-name',
    defaultValue: '',
  },
  {
    path: ['id'],
    name: 'account-id',
    defaultValue: '',
    renderValue: value => (
      <Link to={`/operator/accounts/${value}`}>{value}</Link>
    ),
  },
  {
    path: ['billingContact', 'email'],
    name: 'email',
    defaultValue: '',
  },
  {
    path: ['users', 'length'],
    name: 'users',
    defaultValue: '',
  },
  {
    path: ['balance'],
    name: 'balance',
    defaultValue: '',
  },
  {
    path: ['type'],
    name: 'acct-type',
    defaultValue: '',
  },
  {
    path: ['marketplace', 'shortName'],
    name: 'marketplace',
    defaultValue: 'Zuora',
  },
]

export const organizationColumnHeaders = [
  'Org Name',
  'Org ID',
  'Owner Email',
  'Account ID',
  'Balance',
  'Type',
  'Provider',
  'Region',
  'Date Created',
]

export const organizationColumnInfo: CellInfo[] = [
  {
    path: ['name'],
    name: 'org-name',
    defaultValue: '',
  },
  {
    path: ['idpeID'],
    name: 'org-id',
    defaultValue: '',
    renderValue: value => (
      <Link to={`/operator/organizations/${value}`}>{value}</Link>
    ),
  },
  {
    path: ['account', 'billingContact', 'email'],
    name: 'email',
    defaultValue: '',
  },
  {
    path: ['account', 'id'],
    name: 'account-id',
    defaultValue: '',
  },
  {
    path: ['account', 'balance'],
    name: 'acct-balance',
    defaultValue: '',
  },
  {
    path: ['account', 'type'],
    name: 'acct-type',
    defaultValue: '',
  },
  {
    path: ['provider'],
    name: 'provider',
    defaultValue: '',
  },
  {
    path: ['region'],
    name: 'region',
    defaultValue: '',
  },
  {
    path: ['date'],
    name: 'date',
    defaultValue: '',
  },
]

export const userColumnInfo: CellInfo[] = [
  {
    path: ['email'],
    header: 'Email',
    name: 'user-email',
    defaultValue: '',
  },
  {
    path: ['id'],
    header: 'ID',
    name: 'user-id',
    defaultValue: '',
  },
  {
    path: ['firstName'],
    header: 'First Name',
    name: 'first-name',
    defaultValue: '',
  },
  {
    path: ['lastName'],
    header: 'Last Name',
    name: 'last-name',
    defaultValue: '',
  },
  {
    path: ['onboardingState'],
    header: 'Onboarding State',
    name: 'onboarding-state',
    defaultValue: '',
  },
  {
    path: ['sfdcContactId'],
    header: 'SFDC Contact ID',
    name: 'sfdc-contact-id',
    defaultValue: '',
  },
  {
    path: ['operator'],
    header: 'Operator',
    name: 'operator',
    defaultValue: 'no',
    renderValue: value => (value ? 'yes' : 'no'),
  },
  {
    path: ['accountId'],
    header: 'Acct ID',
    name: 'acct-id',
    defaultValue: '',
  },
]

export const accountUserHeaderInfo = [
  'First Name',
  'Last Name',
  'User Email',
  'Quartz ID',
  'IDPE ID',
  'Onboarding Status',
]

export const acctUserColumnInfo: CellInfo[] = [
  {
    path: ['firstName'],
    name: 'first-name',
    defaultValue: '',
  },
  {
    path: ['lastName'],
    name: 'last-name',
    defaultValue: '',
  },
  {
    path: ['email'],
    name: 'user-email',
    defaultValue: '',
  },
  {
    path: ['quartzId'],
    name: 'user-quartz-id',
    defaultValue: '',
  },
  {
    path: ['id'],
    name: 'user-idpe-id',
    defaultValue: '',
  },
  {
    path: ['onboardingState'],
    name: 'onboarding-state',
    defaultValue: '',
  },
]

export const accountOrgHeaders = [
  'Org Name',
  'Org ID',
  'Provider',
  'Region',
  'Balance',
]

export const acctOrgColumnInfo: CellInfo[] = [
  {
    path: ['name'],
    name: 'org-name',
    defaultValue: '',
  },
  {
    path: ['idpeID'],
    name: 'org-id',
    defaultValue: '',
    renderValue: value => (
      <Link to={`/operator/organizations/${value}`}>{value}</Link>
    ),
  },
  {path: ['provider'], name: 'provider', defaultValue: ''},
  {path: ['region'], name: 'region', defaultValue: ''},
  {
    path: ['account', 'balance'],
    name: 'acct-balance',
    defaultValue: '',
  },
]

export const billingContactInfo: ResourceInfo[] = [
  {
    path: [['firstName'], ['lastName']],
    header: 'Name',
    name: 'name',
    defaultValue: '',
    renderValue: value => {
      return value.includes(undefined) ? 'N/A' : `${value[0]} ${value[1]}`
    },
  },
  {
    path: [['companyName']],
    header: 'Company Name',
    name: 'company-name',
    defaultValue: '',
  },
  {
    path: [['street1']],
    header: 'Street 1',
    name: 'street-one',
    defaultValue: '',
  },
  {
    path: [['street2']],
    header: 'Street 2',
    name: 'street-two',
    defaultValue: '',
  },
  {
    path: [['city'], ['subdivision'], ['postalCode']],
    header: 'City State and Zip',
    name: 'city-state-zip',
    defaultValue: undefined,
    renderValue: value => {
      return value.includes(undefined) || value.includes(null)
        ? 'N/A'
        : `${value[0]}, ${value[1]} ${value[2]}`
    },
  },
]

export const OperatorRoutes = {
  accounts: '/operator/accounts',
  organizations: '/operator/organizations',
  users: '/operator/users',
}
