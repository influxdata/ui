import React from 'react'
import ResourcesTableRow from 'src/operator/ResourcesTableRow'
import {render, screen} from '@testing-library/react'
import {
  BillingContact,
  MarketplaceSubscription,
  Account,
  TestResource,
  CellInfo,
} from 'src/types/operator'

const testResourceColumnInfo: CellInfo[] = [
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
    path: ['name'],
    header: 'Name',
    name: 'name',
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
    path: ['account', 'marketplaceSubscription', 'marketplace'],
    header: 'Billing Provider',
    name: 'marketplace',
    defaultValue: 'Zuora',
  },
  {
    path: ['account', 'id'],
    header: 'Account ID',
    name: 'account-id',
    defaultValue: '',
  },
  {
    path: ['account', 'billingContact', 'companyName'],
    header: 'Company Name',
    name: 'company-name',
    defaultValue: '',
  },
]

describe('ResourcesTableRow', () => {
  const id = 1
  const users = [{}, {}]
  const balance = 0
  const type = 'free'

  const bc: BillingContact = {
    companyName: 'InfluxData',
    email: 'test@influxdata.com',
    firstName: 'Joe',
    lastName: 'Smith',
    country: 'United States',
    street1: '123 Oak Dr',
    street2: 'Unit 0',
    city: 'San Francisco',
    subdivision: 'California',
    postalCode: 12345,
  }
  const marketplaceSub: MarketplaceSubscription = {
    marketplace: 'AWS',
    subscriberId: 'SUB1',
    status: 'pending',
  }

  const account: Account = {
    id: id,
    users: users,
    organizations: [{}],
    balance: balance,
    type: type,
    billingContact: bc,
    marketplaceSubscription: marketplaceSub,
    zuoraAccountId: '123',
    deletable: false,
  }

  const testResource: TestResource = {
    name: 'Resource',
    id: '1234',
    email: 'resource@influxdata.com',
    operator: true,
    account: account,
  }

  test('can handle resources with no null fields', () => {
    render(
      <table>
        <tbody>
          <ResourcesTableRow
            resource={testResource}
            infos={testResourceColumnInfo}
          />
        </tbody>
      </table>
    )
    expect(screen.queryByTestId('user-email').innerHTML).toEqual(
      'resource@influxdata.com'
    )

    expect(screen.queryByTestId('user-id').innerHTML).toEqual('1234')
    expect(screen.queryByTestId('name').innerHTML).toEqual('Resource')

    expect(screen.queryByTestId('operator').innerHTML).toEqual('yes')
    expect(screen.queryByTestId('marketplace').innerHTML).toEqual(
      marketplaceSub.marketplace
    )
    expect(screen.queryByTestId('marketplace').innerHTML).toEqual('AWS')
    expect(screen.queryByTestId('account-id').innerHTML).toEqual('1')
    expect(screen.queryByTestId('company-name').innerHTML).toEqual('InfluxData')
  })

  test('can handle resources with null billing contact', () => {
    render(
      <table>
        <tbody>
          <ResourcesTableRow
            resource={{
              ...testResource,
              account: {...account, billingContact: null},
            }}
            infos={testResourceColumnInfo}
          />
        </tbody>
      </table>
    )

    expect(screen.queryByTestId('company_name')).toBeNull()
    expect(screen.queryByTestId('email')).toBeNull()
  })

  test('can handle resources with null marketplace', () => {
    render(
      <table>
        <tbody>
          <ResourcesTableRow
            resource={{
              ...testResource,
              account: {...account, marketplaceSubscription: null},
            }}
            infos={testResourceColumnInfo}
          />
        </tbody>
      </table>
    )

    expect(screen.queryByTestId('marketplace').innerHTML).toEqual('Zuora')
  })

  test('can handle resources with fields that use renderValue function', () => {
    render(
      <table>
        <tbody>
          <ResourcesTableRow
            resource={{
              ...testResource,
              operator: false,
            }}
            infos={testResourceColumnInfo}
          />
        </tbody>
      </table>
    )

    expect(screen.queryByTestId('operator').innerHTML).toEqual('no')
  })
})
