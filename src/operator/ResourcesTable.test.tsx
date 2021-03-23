import React from 'react'
import ResourcesTable from 'src/operator/ResourcesTable'
import {render, screen, act, fireEvent} from '@testing-library/react'
import {
  Account,
  BillingContact,
  MarketplaceSubscription,
  TestResource,
  CellInfo,
} from 'src/types/operator'
import {BrowserRouter} from 'react-router-dom'

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

const renderResourcesTable = mockedGet => {
  render(
    <BrowserRouter>
      <ResourcesTable
        infos={testResourceColumnInfo}
        fetchResources={mockedGet}
        tabName="testResources"
        searchBarPlaceholder="search by id"
      />
    </BrowserRouter>
  )
}

describe('ResourcesTable', () => {
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
    id: 1,
    users: [{}, {}],
    organizations: [{}],
    balance: 0,
    type: 'free',
    marketplaceSubscription: marketplaceSub,
    billingContact: bc,
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
  const testResources = [
    testResource,
    {...testResource, id: '12345', email: 'hello@email.com'},
    {...testResource, id: '123456', email: '12345@email.com'},
  ]

  test('renders only header row if no resources', async () => {
    const mockedGet = async () => {
      return Promise.resolve([])
    }
    await act(async () => {
      renderResourcesTable(mockedGet)
    })
    await (() => {
      expect(screen.queryAllByTestId('table-row').length).toBe(0)
    })
  })

  test('renders multiple resources', async () => {
    const mockedGet = async () => {
      return Promise.resolve(testResources)
    }

    await act(async () => {
      renderResourcesTable(mockedGet)
    })
    await (() => {
      expect(screen.queryAllByTestId('table-row').length).toBe(
        testResources.length
      )
    })
  })

  test('resource table updates when search bar has value', async () => {
    const firstSearch = 'email.com'

    const mockedGet = async (searchTerm?) => {
      return searchTerm == firstSearch
        ? Promise.resolve([testResources[1], testResources[2]])
        : Promise.resolve(testResources)
    }

    renderResourcesTable(mockedGet)

    await act(mockedGet)

    const searchbar = screen.getByTestId('searchbar')
    fireEvent.click(searchbar)
    fireEvent.change(searchbar, {target: {value: firstSearch}})

    await act(mockedGet)

    expect(screen.getAllByTestId('table-row').length).toBe(3)
  })

  test('renders helpful message when no search results are returned', async () => {
    const firstSearch = 'gmail.com'

    const mockedGet = async (searchTerm?) => {
      return searchTerm == firstSearch
        ? Promise.resolve([])
        : Promise.resolve(testResources)
    }

    renderResourcesTable(mockedGet)

    await act(mockedGet)

    const searchbar = screen.getByTestId('searchbar')
    fireEvent.click(searchbar)
    fireEvent.change(searchbar, {target: {value: firstSearch}})

    await act(mockedGet)

    expect(screen.queryAllByTestId('table-row').length).toBe(0)
    expect(screen.queryByTestId('empty-state')).toBeTruthy()
  })
})
