import React from 'react'
import {CellInfo, ResourceInfo} from 'src/types'
import {Link} from 'react-router-dom'

export const accountHeaderInfo = [
  'Account Name',
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
    path: 'name',
    name: 'name',
    defaultValue: '',
  },
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
    path: 'marketplaceSubscription.marketplace',
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
  'Storage Type'
]

export const organizationColumnInfo: CellInfo[] = [
  {
    path: 'name',
    name: 'org-name',
    defaultValue: '',
  },
  {
    path: 'idpeId',
    name: 'org-id',
    defaultValue: '',
    renderValue: value => <Link to={`/operator/orgs/${value}`}>{value}</Link>,
  },
  {
    path: 'account.billingContact.email',
    name: 'email',
    defaultValue: '',
  },
  {
    path: 'account.id',
    name: 'account-id',
    defaultValue: '',
    renderValue: value => (
      <Link to={`/operator/accounts/${value}`}>{value}</Link>
    ),
  },
  {
    path: 'account.balance',
    name: 'acct-balance',
    defaultValue: '',
  },
  {
    path: 'account.type',
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
  {
    path: 'storageType',
    name: 'storage_type',
    defaultValue: '',
  },
]

export const accountUserHeaderInfo = [
  'First Name',
  'Last Name',
  'User Email',
  'Quartz ID',
  'IDPE ID',
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
    path: 'id',
    name: 'user-quartz-id',
    defaultValue: '',
  },
  {
    path: 'idpeId',
    name: 'user-idpe-id',
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
    path: 'idpeId',
    name: 'org-id',
    defaultValue: '',
    renderValue: value => <Link to={`/operator/orgs/${value}`}>{value}</Link>,
  },
  {path: 'provider', name: 'provider', defaultValue: ''},
  {path: 'region', name: 'region', defaultValue: ''},
  {
    path: 'account.balance',
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
