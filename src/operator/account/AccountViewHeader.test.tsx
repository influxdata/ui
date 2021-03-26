import React from 'react'
import {render, screen, act, fireEvent} from '@testing-library/react'

import AccountView from 'src/operator/account/AccountView'
import {createBrowserHistory} from 'history'
import {
  Account,
  BillingContact,
  MarketplaceSubscription,
} from 'src/types/operator'
import {Router} from 'react-router-dom'

describe('Account View Header', () => {
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

  const renderAccountView = fetchResource => {
    const route = `/operator/accounts/${id}`
    history.push(route)

    render(
      <Router history={history}>
        <AccountView fetchResource={fetchResource} />
      </Router>
    )
  }

  test('clicking on Back to Account list redirects to home page', async () => {
    const fetchResource = async (_id: number) => {
      return Promise.resolve({...account, deletable: true})
    }

    await act(async () => {
      renderAccountView(fetchResource)
    })

    fireEvent.click(screen.getByTestId('back-button'))

    expect(history.location.pathname).toBe('/operator')
  })

  test('renders enabled delete button for a deletable account', async () => {
    const fetchResource = async (_id: number) => {
      return Promise.resolve({...account, deletable: true})
    }

    await act(async () => {
      renderAccountView(fetchResource)
    })

    expect(screen.getByTestId('delete-button')).toHaveProperty(
      'disabled',
      false
    )
  })

  test('renders disabled delete button for a non-deletable account', async () => {
    const fetchResource = async (_id: number) => {
      return Promise.resolve(account)
    }

    await act(async () => {
      renderAccountView(fetchResource)
    })

    expect(screen.getByTestId('delete-button')).toHaveProperty('disabled', true)
  })
})
