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
    path: 'billingContact.companyName',
    name: 'company-name',
    defaultValue: '',
  },
  {
    path: 'id',
    name: 'account-id',
    defaultValue: '',
    renderValue: value => (
      <Link to={`/operator/accounts/${value}`}>{value}</Link>
    ),
  },
  {
    path: 'billingContact.email',
    name: 'email',
    defaultValue: '',
  },
  {
    path: 'users.length',
    name: 'users',
    defaultValue: '',
  },
  {
    path: 'balance',
    name: 'balance',
    defaultValue: '',
  },
  {
    path: 'type',
    name: 'acct-type',
    defaultValue: '',
  },
  {
    path: 'marketplace.shortName',
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
    path: 'name',
    name: 'org-name',
    defaultValue: '',
  },
  {
    path: 'quartzId',
    name: 'org-id',
    defaultValue: '',
    renderValue: value => <Link to={`/operator/orgs/${value}`}>{value}</Link>,
  },
  {
    path: 'accountEmail',
    name: 'email',
    defaultValue: '',
  },
  {
    path: 'accountId',
    name: 'account-id',
    defaultValue: '',
  },
  {
    path: 'accountBalance',
    name: 'acct-balance',
    defaultValue: '',
  },
  {
    path: 'accountType',
    name: 'acct-type',
    defaultValue: '',
  },
  {
    path: 'provider',
    name: 'provider',
    defaultValue: '',
  },
  {
    path: 'region',
    name: 'region',
    defaultValue: '',
  },
  {
    path: 'date',
    name: 'date',
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
    path: 'firstName',
    name: 'first-name',
    defaultValue: '',
  },
  {
    path: 'lastName',
    name: 'last-name',
    defaultValue: '',
  },
  {
    path: 'email',
    name: 'user-email',
    defaultValue: '',
  },
  {
    path: 'quartzId',
    name: 'user-quartz-id',
    defaultValue: '',
  },
  {
    path: 'id',
    name: 'user-idpe-id',
    defaultValue: '',
  },
  {
    path: 'onboardingState',
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
    path: 'name',
    name: 'org-name',
    defaultValue: '',
  },
  {
    path: 'id',
    name: 'org-id',
    defaultValue: '',
    renderValue: value => <Link to={`/operator/orgs/${value}`}>{value}</Link>,
  },
  {path: 'provider', name: 'provider', defaultValue: ''},
  {path: 'region', name: 'region', defaultValue: ''},
  {
    path: 'accountBalance',
    name: 'acct-balance',
    defaultValue: '',
  },
]

export const billingContactInfo: ResourceInfo[] = [
  {
    path: ['firstName', 'lastName'],
    header: 'Name',
    name: 'name',
    defaultValue: '',
    renderValue: value => {
      return value.includes(undefined) ? 'N/A' : `${value[0]} ${value[1]}`
    },
  },
  {
    path: ['companyName'],
    header: 'Company Name',
    name: 'company-name',
    defaultValue: '',
  },
  {
    path: ['street1'],
    header: 'Street 1',
    name: 'street-one',
    defaultValue: '',
  },
  {
    path: ['street2'],
    header: 'Street 2',
    name: 'street-two',
    defaultValue: '',
  },
  {
    path: ['city', 'subdivision', 'postalCode'],
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
  default: '/operator',
  accounts: '/operator/accounts',
  organizations: '/operator/orgs',
  users: '/operator/users',
}
