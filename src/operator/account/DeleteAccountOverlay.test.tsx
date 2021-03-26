import React from 'react'
import {
  Account,
  BillingContact,
  MarketplaceSubscription,
} from 'js/types/accounts'
import {screen, render, act, fireEvent} from '@testing-library/react'
import {Router} from 'react-router-dom'
import AccountView from './AccountView'
import {createBrowserHistory} from 'history'

describe('Delete Account Overlay', () => {
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

  const deleteAccount = async (_id: number) => {
    return Promise.resolve({data: ''})
  }

  const renderAccountView = (fetchResource, time?, deleteResource?) => {
    const deleteItem = deleteResource || deleteAccount
    const route = `/operator/accounts/${id}`
    history.push(route)

    render(
      <Router history={history}>
        <AccountView
          fetchResource={fetchResource}
          deleteResource={deleteItem}
          transitionTime={time}
        />
      </Router>
    )
  }

  test('renders when deletable is true and delete account button is clicked', async () => {
    const fetchResource = async (_id: number) => {
      return Promise.resolve({...account, deletable: true})
    }

    await act(async () => {
      renderAccountView(fetchResource)
    })

    fireEvent.click(screen.getByTestId('delete-button'))

    expect(screen.getByTestId('delete-overlay')).toBeTruthy()
  })

  test('does not render when account is not deletable and button is clicked', async () => {
    const fetchResource = async (_id: number) => {
      return Promise.resolve(account)
    }

    await act(async () => {
      renderAccountView(fetchResource)
    })

    fireEvent.click(screen.getByTestId('delete-button'))

    expect(screen.queryByTestId('delete-overlay')).toBeNull()
  })

  test('redirects back to accounts table when confirmation button is clicked', async () => {
    const fetchResource = async (_id: number) => {
      return Promise.resolve({...account, deletable: true})
    }

    await act(async () => {
      renderAccountView(fetchResource)
    })

    fireEvent.click(screen.getByTestId('delete-button'))

    await act(async () => {
      fireEvent.click(screen.getByTestId('confirmation-button'))
    })

    expect(history.location.pathname).toBe('/operator')
  })

  test('overlay disappears when the exit button is clicked', async () => {
    const fetchResource = async (_id: number) => {
      return Promise.resolve({...account, deletable: true})
    }

    await act(async () => {
      renderAccountView(fetchResource, 0)
    })

    fireEvent.click(screen.getByTestId('delete-button'))

    const dismiss = screen.getAllByRole('button').filter(x => {
      return x.className == 'cf-overlay--dismiss'
    })[0]

    await act(async () => {
      fireEvent.click(dismiss)
    })

    expect(screen.queryByTestId('delete-overlay')).toBeNull()
  })

  test('renders alert when there is an error in deleting an account', async () => {
    const fetchResource = async (_id: number) => {
      return Promise.resolve({...account, deletable: true})
    }

    const deleteAccountError = async (_id?: number) => {
      return Promise.resolve({data: {error: 'unable to delete account'}})
    }

    await act(async () => {
      renderAccountView(fetchResource, 0, deleteAccountError)
    })

    fireEvent.click(screen.getByTestId('delete-button'))
    fireEvent.click(screen.getByTestId('confirmation-button'))

    await act(async () => deleteAccountError(id))

    expect(screen.queryByTestId('delete-overlay')).toBeNull()
    expect(screen.getByTestId('delete-alert')).toBeTruthy()
  })
})
