import React from 'react'
import {
  Account,
  BillingContact,
  MarketplaceSubscription,
} from 'js/types/accounts'
import {screen, render, act} from '@testing-library/react'
import {Router} from 'react-router-dom'
import AccountView from './AccountView'
import {createBrowserHistory} from 'history'

describe('Account Grid', () => {
  const name = 'Joe Smith'
  const company = 'InfluxData'
  const street1 = '123 Oak Dr'
  const street2 = 'Unit 0'
  const restOfAddress = 'San Francisco, California 12345'

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
    users: [{id: 2, sfdcContactId: 'abc123'}],
    organizations: [{id: 3, provider: 'GCP'}],
    balance: 200,
    type: 'free',
    marketplaceSubscription: marketplaceSub,
    billingContact: bc,
    zuoraAccountId: null,
    deletable: true,
  }

  const history = createBrowserHistory()

  const renderAccountView = (fetchResource, deleteResource) => {
    const route = `/operator/accounts/${id}`
    history.push(route)

    render(
      <Router history={history}>
        <AccountView
          fetchResource={fetchResource}
          deleteResource={deleteResource}
        />
      </Router>
    )
  }

  test('renders all account related info when it exists', async () => {
    const fetchResource = async (_id: number) => {
      return Promise.resolve(account)
    }

    await act(async () => {
      renderAccountView(fetchResource, null)
    })

    //headers
    expect(screen.queryByTestId('account-type-header').innerHTML).toEqual(
      'Account Type'
    )
    expect(screen.queryByTestId('billing-provider-header').innerHTML).toEqual(
      'Billing Provider'
    )
    expect(screen.queryByTestId('account-balance-header').innerHTML).toEqual(
      'Account Balance'
    )
    expect(screen.queryByTestId('billing-acctid-header').innerHTML).toEqual(
      'Billing Account ID'
    )
    expect(screen.queryByTestId('cloud-provider-header').innerHTML).toEqual(
      'Cloud Provider'
    )
    expect(screen.queryByTestId('salesforce-id-header').innerHTML).toEqual(
      'Salesforce ID'
    )
    expect(
      screen.queryByTestId('subscription-status-header').innerHTML
    ).toEqual('Subscription Status')
    expect(screen.queryByTestId('billing-contact-header').innerHTML).toEqual(
      'Billing Contact'
    )

    //info
    expect(screen.queryByTestId('account-type-body').innerHTML).toEqual('free')
    expect(screen.queryByTestId('billing-provider-body').innerHTML).toEqual(
      'AWS'
    )
    expect(screen.queryByTestId('account-balance-body').innerHTML).toEqual(
      '$200.00'
    )
    expect(screen.queryByTestId('billing-acctid-body').innerHTML).toEqual(
      'SUB1'
    )
    expect(screen.queryByTestId('cloud-provider-body').innerHTML).toEqual('GCP')
    expect(screen.queryByTestId('salesforce-id-body').innerHTML).toEqual(
      'abc123'
    )
    expect(screen.queryByTestId('subscription-status-body').innerHTML).toEqual(
      'pending'
    )
    expect(screen.queryByText(name)).toBeTruthy()
    expect(screen.queryByText(company)).toBeTruthy()
    expect(screen.queryByText(street1)).toBeTruthy()
    expect(screen.queryByText(street2)).toBeTruthy()
    expect(screen.queryByText(restOfAddress)).toBeTruthy()
  })
})
