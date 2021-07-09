// Libraries
import React from 'react'
import {screen, fireEvent, cleanup} from '@testing-library/react'

// Components
import SearchBar from 'src/alerting/components/SearchBar'

import {renderWithReduxAndRouter} from 'src/mockState'
import {withRouterProps} from 'mocks/dummyData'

jest.mock('src/resources/components/GetResources')

const exampleSearches = ['search 1', 'example 2', 'text 3']

const setup = (override = {}) => {
  const props: Parameters<typeof SearchBar>[0] = {
    ...withRouterProps,
    dispatch: jest.fn(),
    exampleSearches,
    loadRows: jest.fn(),
    state: {searchInput: ''} as any,
    children: <></>,
    placeholder: '',
    ...override,
  }

  return renderWithReduxAndRouter(<SearchBar {...props} />)
}

describe('Alerts SearchBar', () => {
  beforeEach(cleanup)

  it('show/hide autocomplete', () => {
    const {baseElement} = setup({})

    const searchInput = screen.getByTestId('check-status-input')
    fireEvent.focus(searchInput)

    exampleSearches.forEach(text => {
      const autocompleteElm = screen.queryAllByText(text)
      expect(autocompleteElm.length).toBe(1)
    })

    fireEvent.mouseDown(baseElement)

    exampleSearches.forEach(text => {
      const autocompleteElm = screen.queryAllByText(text)
      expect(autocompleteElm.length).toBe(0)
    })
  })
})
