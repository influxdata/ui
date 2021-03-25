import React from 'react'
import {CellInfo, ResourceInfo} from 'src/types/operator'
import AccountID from 'src/operator/AccountID'
import OrgID from 'src/operator/OrgID'
import {Link} from 'react-router-dom'

export const accountHeaderInfo = [
  'company-name',
  'account-id',
  'email',
  'users',
  'balance',
  'acct-type',
  'marketplace',
]

export const accountColumnInfo: CellInfo[] = [
  {
    path: ['billingContact', 'companyName'],
    header: 'Company Name',
    defaultValue: '',
  },
  {
    path: ['id'],
    header: 'Acct ID',
    defaultValue: '',
    renderValue: value => <AccountID value={value} />,
  },
  {
    path: ['billingContact', 'email'],
    header: 'Owner Email',
    defaultValue: '',
  },
  {
    path: ['users', 'length'],
    header: 'Users',
    defaultValue: '',
  },
  {
    path: ['balance'],
    header: 'Balance',
    defaultValue: '',
  },
  {
    path: ['type'],
    header: 'Account Type',
    defaultValue: '',
  },
  {
    path: ['marketplace'],
    header: 'Billing Provider',
    defaultValue: 'Zuora',
  },
]

export const organizationColumnHeaders = [
  'org-name',
  'org-id',
  'email',
  'account-id',
  'acct-balance',
  'acct-type',
  'provider',
  'region',
  'date',
]

export const organizationColumnInfo: CellInfo[] = [
  {
    path: ['name'],
    header: 'Org Name',
    defaultValue: '',
  },
  {
    path: ['idpeID'],
    header: 'Org ID',
    defaultValue: '',
    renderValue: value => (
      <Link to={`/operator/organizations/${value}`}>{value}</Link>
    ),
  },
  {
    path: ['account', 'billingContact', 'email'],
    header: 'Owner Email',
    defaultValue: '',
  },
  {
    path: ['account', 'id'],
    header: 'Account ID',
    defaultValue: '',
  },
  {
    path: ['account', 'balance'],
    header: 'Balance',
    defaultValue: '',
  },
  {
    path: ['account', 'type'],
    header: 'Type',
    defaultValue: '',
  },
  {
    path: ['provider'],
    header: 'Provider',
    defaultValue: '',
  },
  {
    path: ['region'],
    header: 'Region',
    defaultValue: '',
  },
  {
    path: ['date'],
    header: 'Date Created',
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

export const acctUserColumnInfo: CellInfo[] = [
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
    path: ['email'],
    header: 'User Email',
    name: 'user-email',
    defaultValue: '',
  },
  {
    path: ['id'],
    header: 'Quartz ID',
    name: 'user-quartz-id',
    defaultValue: '',
  },
  {
    path: ['idpeId'],
    header: 'IDPE ID',
    name: 'user-idpe-id',
    defaultValue: '',
  },
  {
    path: ['onboardingState'],
    header: 'Onboarding Status',
    name: 'onboarding-state',
    defaultValue: '',
  },
]

export const acctOrgColumnInfo: CellInfo[] = [
  {
    path: ['name'],
    header: 'Org Name',
    name: 'org-name',
    defaultValue: '',
  },
  {
    path: ['idpeID'],
    header: 'Org ID',
    name: 'org-id',
    defaultValue: '',
    renderValue: value => <OrgID orgID={value} />,
  },
  {path: ['provider'], header: 'Provider', name: 'provider', defaultValue: ''},
  {path: ['region'], header: 'Region', name: 'region', defaultValue: ''},
  {
    path: ['account', 'balance'],
    header: 'Balance',
    name: 'acct-balance',
    defaultValue: '',
  },
]

export const billingContactInfo: ResourceInfo[] = [
  {
    path: [
      ['billingContact', 'firstName'],
      ['billingContact', 'lastName'],
    ],
    header: 'Name',
    name: 'name',
    defaultValue: '',
    renderValue: value => {
      return value.includes(undefined) ? 'N/A' : `${value[0]} ${value[1]}`
    },
  },
  {
    path: [['billingContact', 'companyName']],
    header: 'Company Name',
    name: 'company-name',
    defaultValue: '',
  },
  {
    path: [['billingContact', 'street1']],
    header: 'Street 1',
    name: 'street-one',
    defaultValue: '',
  },
  {
    path: [['billingContact', 'street2']],
    header: 'Street 2',
    name: 'street-two',
    defaultValue: '',
  },
  {
    path: [
      ['billingContact', 'city'],
      ['billingContact', 'subdivision'],
      ['billingContact', 'postalCode'],
    ],
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
