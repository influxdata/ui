// Libraries
import React from 'react'
import {fireEvent, screen} from '@testing-library/react'

// Fixtures
import {renderWithReduxAndRouter} from 'src/mockState'
import GenerateTokenDropdown from 'src/authorizations/components/GenerateTokenDropdown'

const setup = () => {
  return renderWithReduxAndRouter(<GenerateTokenDropdown />)
}

describe('GenerateTokenDropdown', () => {
  it('renders the dropdown', () => {
    const {queryByTestId} = setup()

    expect(queryByTestId('dropdown--gen-token')).toBeVisible()
    expect(queryByTestId('dropdown-button--gen-token')).toBeVisible()
  })
  it('renders the dropdown options', () => {
    const {queryByText} = setup()

    fireEvent.click(screen.getByTestId('dropdown-button--gen-token'))

    expect(queryByText('All Access API Token')).toBeVisible()
    expect(queryByText('Custom API Token')).toBeVisible()
  })
})
