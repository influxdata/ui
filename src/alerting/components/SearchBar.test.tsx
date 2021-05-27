// Libraries
import React from 'react'
import {screen, fireEvent, prettyDOM} from '@testing-library/react'

// Components
import SearchBar from 'src/alerting/components/SearchBar'

import {renderWithReduxAndRouter} from 'src/mockState'
import {withRouterProps} from 'mocks/dummyData'

jest.mock('src/resources/components/GetResources')

const exampleSearches = ["search 1", "example 2", "text 3"];

const setup = (override = {}) => {
  const props: Parameters<typeof SearchBar>[0] = {
    ...withRouterProps,
    dispatch: jest.fn(),
    exampleSearches,
    loadRows: jest.fn(),
    state: { searchInput: "" } as any,
    children: <></>,
    placeholder: "",
    ...override,
  }

  return renderWithReduxAndRouter(<SearchBar {...props} />)
}

describe('Alerts SearchBar', () => {
  it('show/hide autocomplete', async () => {
    const {baseElement} = setup({})

    // console.log(prettyDOM(baseElement));

    const searchInput = screen.getByTestId('check-status-input')
    fireEvent.focus(searchInput)

    // console.log(prettyDOM(baseElement));

    exampleSearches.forEach(text=>{
      const autocompleteElm = screen.getAllByText(text);
      expect(autocompleteElm.length).toBe(1);
    })

    fireEvent.blur(searchInput)

    // console.log(prettyDOM(baseElement));

    // exampleSearches.forEach(text=>{
    //   const autocompleteElm = screen.getAllByText(text);
    //   expect(autocompleteElm.length).toBe(0);
    // })

  })
})
