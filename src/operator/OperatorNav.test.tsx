import React from 'react'
import {render, act, fireEvent, screen} from '@testing-library/react'
import Operator from 'src/operator/Operator'
import {Router} from 'react-router-dom'
import {createBrowserHistory} from 'history'
import {User} from 'src/types/operator'
import 'intersection-observer'

describe('Navigation', () => {
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

    return render(
      <Router history={history}>
        <Operator operator={operator} fetchResources={mockedFetchResources} />
      </Router>
    )
  }
  test('click on icon reveals navigation menu', async () => {
    await act(async () => {
      renderOperator()
    })
    fireEvent.click(screen.getByTestId('operator-nav-button'))
    expect(screen.getByTestId('refless-popover--contents')).toBeTruthy()
    expect(screen.getByText('hello@influxdata.com')).toBeTruthy()
  })

  test('clicking on Logout item logs out the operator', async () => {
    await act(async () => {
      renderOperator()
    })
    fireEvent.click(screen.getByTestId('operator-nav-button'))
    fireEvent.click(screen.getByTestId('logout-button'))

    expect(history.location.pathname).toEqual('/logout')
  })
})
