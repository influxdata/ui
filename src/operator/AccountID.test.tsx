import React from 'react'
import {render, screen, fireEvent, act} from '@testing-library/react'
import Operator from 'src/operator/Operator'
import {Router} from 'react-router-dom'
import {createBrowserHistory} from 'history'
import {
  Account,
  BillingContact,
  MarketplaceSubscription,
  User,
} from 'src/types/operator'

describe('Account ID', () => {
  const id = 1324
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
    users: [{}, {}],
    organizations: [{}, {}],
    balance: 0,
    type: 'free',
    marketplaceSubscription: marketplaceSub,
    billingContact: bc,
    zuoraAccountId: '123',
    deletable: false,
  }
  const operator: User = {
    firstName: 'Hello',
    lastName: 'Goodbye',
    id: '1',
    idpeId: 'abc123',
    email: 'hello@influxdata.com',
    operator: true,
    onboardingState: 'complete',
    sfdcContactId: 'abc123',
    accountId: '1',
  }

  const history = createBrowserHistory()

  const renderOperator = () => {
    const mockedFetchResources = async () => {
      return Promise.resolve([account])
    }

    const route = '/operator'
    history.push(route)

    render(
      <Router history={history}>
        <Operator operator={operator} fetchResources={mockedFetchResources} />
      </Router>
    )
  }
  test('account view is rendered when account ID is clicked', async () => {
    await act(async () => {
      renderOperator()
    })

    const acctID = screen.getByTestId(`accountID${id}`)
    fireEvent.click(acctID)

    expect(history.location.pathname).toEqual(`/operator/accounts/${id}`)
  })
})
