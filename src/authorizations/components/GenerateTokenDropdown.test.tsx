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

import GenerateTokenDropdown from 'src/authorizations/components/GenerateTokenDropdown'

const testState = {
  flags: {
    status: RemoteDataState.Done,
    original: {
      tokensUIRedesign: false,
    },
    override: {},
  },
}

const setup = (flagOn = false) => {
  if (flagOn) {
    const newState = {
      ...testState,
    }
    newState.flags.original = {
      tokensUIRedesign: true,
    }
    newState.flags.override = {
      tokensUIRedesign: true,
    }
    return renderWithReduxAndRouter(<GenerateTokenDropdown />, () => {
      return {flags: {original: {tokensUIRedesign: true}}}
    })
  }
  return renderWithReduxAndRouter(<GenerateTokenDropdown />, () => testState)
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
    const {queryByText} = setup(true)

    fireEvent.click(screen.getByTestId('dropdown-button--gen-token'))

    expect(queryByText('Read/Write Token')).toBeNull()
    expect(queryByText('All Access Token')).toBeVisible()
    expect(queryByText('Custom API Token')).toBeNull()
  })
})
