// Libraries
import React from 'react'
import {fireEvent, screen} from '@testing-library/react'

// Fixtures
import {renderWithReduxAndRouter} from 'src/mockState'
import {mockAppState} from 'src/mockAppState'
import {RemoteDataState} from '@influxdata/clockface'

jest.mock('src/shared/constants', () => ({
  CLOUD: true,
}))


const isFlagEnabledMock = jest.fn(() => {
  return false
})
jest.mock('src/shared/utils/featureFlag', () => {
  return {
    isFlagEnabled: isFlagEnabledMock,
  }
})

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

    expect(queryByText('Read/Write Token')).toBeVisible()
    expect(queryByText('All Access Token')).toBeVisible()
    expect(queryByText('Custom API Token')).toBeNull()
  })

  it('renders the new dropdown options when the flag is on', () => {
    isFlagEnabledMock.mockImplementationOnce(() => {
      return true
    })
    const {queryByText} = setup()

    fireEvent.click(screen.getByTestId('dropdown-button--gen-token'))

    expect(queryByText('Read/Write Token')).toBeNull()
    expect(queryByText('All Access Token')).toBeVisible()
    expect(queryByText('Custom API Token')).toBeNull()
  })
})
