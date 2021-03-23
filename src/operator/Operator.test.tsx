import React from 'react'
import {render, screen, fireEvent, act} from '@testing-library/react'
import Operator from 'src/operator/Operator'
import {Router} from 'react-router-dom'
import {createBrowserHistory} from 'history'
import {User} from 'src/types/operator'

describe('Operator page', () => {
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
      return Promise.resolve([])
    }

    const route = '/operator'
    history.push(route)

    render(
      <Router history={history}>
        <Operator operator={operator} fetchResources={mockedFetchResources} />
      </Router>
    )
  }

  const expectIsActiveTab = tab =>
    expect(tab.className.includes('cf-tabs--tab__active'))

  const expectLocationIs = path => {
    expect(history.location.pathname).toBe(path)
  }

  const expectTabText = tab => expect(tab.firstChild.textContent)

  beforeEach(() =>
    act(async () => {
      renderOperator()
    })
  )

  test('renders searchbar', async () => {
    expect(screen.getByTestId('searchbar')).toBeTruthy()
  })

  test('renders with Accounts as default active tab', async () => {
    const accountTab = screen.getByTestId('accountTab')

    expectLocationIs('/operator')

    await (() => {
      expect(screen.getByTestId('accountHeaderRow')).toBeTruthy()
    })

    await act(async () => {
      fireEvent.click(accountTab)
    })

    expectLocationIs('/operator/accounts')
    expectIsActiveTab(accountTab)
    expectTabText(accountTab).toEqual('Accounts')
  })

  test('renders Orgs table with active tab when Organization tab is clicked', async () => {
    const orgTab = screen.getByTestId('orgTab')

    await act(async () => {
      fireEvent.click(orgTab)
    })

    expectLocationIs('/operator/organizations')
    expectIsActiveTab(orgTab)
    expectTabText(orgTab).toEqual('Organizations')

    await (() => {
      expect(screen.getByTestId('orgHeaderRow')).toBeTruthy()
    })
  })
})
