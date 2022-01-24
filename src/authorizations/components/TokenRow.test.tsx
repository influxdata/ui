// Libraries
import React from 'react'

// Fixtures
import {TokenRow} from './TokenRow'
import {auth} from 'mocks/dummyData'
import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override?) => {
  const authorization = {
    ...auth,
    description: 'XYZ',
    createdAt: '2020-08-19T23:13:44.514Z',
    updatedAt: '2020-08-19T23:13:44.514Z',
  }

  const props = {
    auth: authorization,
    onClickDescription: jest.fn(),
    onClone: jest.fn(),
    ...override,
  }
  return renderWithReduxAndRouter(<TokenRow {...props} />)
}

describe('TokenRowResourceCard', () => {
  it('should render', () => {
    const {getByTestId} = setup()
    expect(getByTestId('token-card XYZ')).toBeDefined()
    expect(getByTestId('token-name XYZ')).toBeDefined()
  })

  it('displays delete button', () => {
    const {getByTestId} = setup()

    expect(getByTestId('context-delete-menu--button')).toBeVisible()
  })
})
