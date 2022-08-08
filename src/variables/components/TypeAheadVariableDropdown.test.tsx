// Libraries
import React from 'react'
import {fireEvent, screen} from '@testing-library/react'

// Components
import TypeAheadVariableDropdown from 'src/variables/components/TypeAheadVariableDropdown'

// Utils
import {renderWithRedux} from 'src/mockState'
import {AppState, RemoteDataState} from 'src/types'

// map variable name
const variable_name = 'xkcd_meme'

// map variable values
const xkcd_name_to_url_map = {
  'Bad Code': 'https://xkcd.com/1926/',
  'Debugging': 'https://xkcd.com/1722/',
  'ISO 8601': 'https://xkcd.com/1179/',
  'Random Number': 'https://xkcd.com/221/',
  'Tags': 'https://xkcd.com/1144/',
}

const values_with_a = {
  'Bad Code': 'https://xkcd.com/1926/',
  'Random Number': 'https://xkcd.com/221/',
  'Tags': 'https://xkcd.com/1144/',
}

const values_with_b = {
  'Bad Code': 'https://xkcd.com/1926/',
  'Debugging': 'https://xkcd.com/1722/',
  'Random Number': 'https://xkcd.com/221/',
}

const values_with_c = {
  'Bad Code': 'https://xkcd.com/1926/',
}

const initialState = (state: AppState): AppState => {
  return {
    ...state,
    currentDashboard: {
      id: '03c8070355fbd000',
    },
    resources: {
      ...state.resources,
      variables: {
        allIDs: ['03cbdc8a53a63000'],
        status: RemoteDataState.Done,
        byID: {
          '03cbdc8a53a63000': {
            id: '03cbdc8a53a63000',
            orgID: '03c02466515c1000',
            name: variable_name,
            description: '',
            selected: null,
            arguments: {
              type: 'map',
              values: xkcd_name_to_url_map,
            },
            labels: [],
            status: RemoteDataState.Done,
          },
        },
        values: {
          '03c8070355fbd000': {
            status: RemoteDataState.Done,
            values: {
              '03cbdc8a53a63000': {
                values: xkcd_name_to_url_map,
                selected: [''],
              },
            },
            order: ['03cbdc8a53a63000'],
          },
        },
      },
    },
  }
}

describe('Dashboards.Components.VariablesControlBar.TypeAheadVariableDropdown', () => {
  describe('variable map type', () => {
    it('renders dropdown with keys as dropdown items', () => {
      const {getByTestId, getAllByTestId} = renderWithRedux(
        <TypeAheadVariableDropdown variableID="03cbdc8a53a63000" />,
        initialState
      )

      const dropdownButton = getByTestId('typeAhead-dropdown--button')
      fireEvent.click(dropdownButton)
      const dropdownItems = getAllByTestId('typeAhead-dropdown--item').map(
        node => node.id
      )

      expect(dropdownItems).toEqual(Object.keys(xkcd_name_to_url_map))
    })
  })

  it('filters properly while typing in the input', () => {
    const {getByTestId, getAllByTestId} = renderWithRedux(
      <TypeAheadVariableDropdown variableID="03cbdc8a53a63000" />,
      initialState
    )

    const filterInput = getByTestId(
      `variable-dropdown--${variable_name}--typeAhead-input`
    )

    const checkDropdown = (filterText, expectedList) => {
      fireEvent.click(filterInput)
      fireEvent.change(filterInput, {target: {value: filterText}})
      const dropdownItems = getAllByTestId('typeAhead-dropdown--item').map(
        node => node.id
      )
      expect(dropdownItems).toEqual(Object.keys(expectedList))
    }

    // filter on the string 'a':
    checkDropdown('a', values_with_a)

    // clear input, should see everything:
    checkDropdown('', xkcd_name_to_url_map)

    // filter again by text:
    checkDropdown('b', values_with_b)
    checkDropdown('c', values_with_c)

    // something that won't match anything
    // (see: https://testing-library.com/docs/guide-disappearance/#asserting-elements-are-not-present)
    fireEvent.change(filterInput, {target: {value: 'this_string_will_not_match'}})
    const items = screen.queryByTestId('variable-dropdown--item')
    expect(items).toBeNull() // it doesn't exist
  })
})
