import React from 'react'
import {fireEvent, render, screen, act} from '@testing-library/react'
import {Router} from 'react-router-dom'
import {createBrowserHistory} from 'history'
import {
  Account,
  BillingContact,
  MarketplaceSubscription,
} from 'js/types/accounts'
import AccountView from './AccountView'
import 'intersection-observer'

describe('Account View Table', () => {
  //tables
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
  const id = 1
  const account: Account = {
    id: id,
    users: [{id: 2}],
    organizations: [{id: 3}],
    balance: 0,
    type: 'free',
    marketplaceSubscription: marketplaceSub,
    billingContact: bc,
    zuoraAccountId: '123',
    deletable: false,
  }

  const history = createBrowserHistory()

  const renderAccountView = (
    fetchResource,
    removeUserFromAccount = undefined
  ) => {
    const route = `/operator/accounts/${id}`
    history.push(route)

    render(
      <Router history={history}>
        <AccountView
          fetchResource={fetchResource}
          removeUserFromAccount={removeUserFromAccount}
        />
      </Router>
    )
  }

  test('renders orgs and users info when account has associated orgs and users', async () => {
    const fetchResource = async (_id: number) => {
      return Promise.resolve({...account, deletable: true})
    }

    await act(async () => {
      renderAccountView(fetchResource)
    })

    expect(screen.getAllByTestId('table-row').length).toBe(4)
  })

  test('renders Remove User confirmation button in user rows', async () => {
    const users = [{id: 1}, {id: 2}]
    const fetchResource = async (_id: number) => {
      return Promise.resolve({...account, users: users})
    }
    const removeUserFromAccount = async _id => {}

    await act(async () => {
      renderAccountView(fetchResource, removeUserFromAccount)
    })

    expect(screen.getAllByText('Remove User').length).toBe(users.length)
  })

  test('clicking remove user requires confirmation and once confirmed will refresh account', async () => {
    let fetchCount = 0
    const users = [{id: 1}, {id: 2}]

    const fetchResource = async (_id: number) => {
      fetchCount += 1
      return Promise.resolve({
        ...account,
        users: fetchCount === 1 ? users : users.slice(1),
      })
    }
    const removeUserFromAccount = async _id => {}

    await act(async () => {
      renderAccountView(fetchResource, removeUserFromAccount)
    })

    const removeButton = screen.getAllByText('Remove User')[0]
    fireEvent.click(removeButton)
    const confirmation = screen.getByTestId(
      'confirmation-button--confirm-button'
    )
    await act(async () => {
      fireEvent.click(confirmation)
    })

    expect(screen.getAllByText('Remove User').length).toBe(users.length - 1)
  })

  test('renders empty table when account has no orgs or users', async () => {
    const newAccount = {...account, organizations: [], users: []}

    const fetchResource = async (_id: number) => {
      return Promise.resolve(newAccount)
    }

    await act(async () => {
      renderAccountView(fetchResource)
    })

    expect(screen.getAllByTestId('empty-state').length).toBe(2)
  })
})
