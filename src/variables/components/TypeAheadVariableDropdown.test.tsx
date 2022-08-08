// Libraries
import React from 'react'
import {fireEvent, screen} from '@testing-library/react'

// Components
import TypeAheadVariableDropdown from 'src/variables/components/TypeAheadVariableDropdown'

// Utils
import {renderWithRedux} from 'src/mockState'
import {AppState, RemoteDataState} from 'src/types'

const values = {
  always: 'always',
  def: 'defbuck',
  def2: 'defbuck2',
  foo: 'foobuck',
  goo: 'goobuck',
  new: 'newBuck',
  really: 'reallyYes',
  REALLy2: 'anotherReally',
}
const fvalues = {
  def: 'defbuck',
  def2: 'defbuck2',
  foo: 'foobuck',
}

const evalues = {
  def: 'defbuck',
  def2: 'defbuck2',
  new: 'newBuck',
  really: 'reallyYes',
  REALLy2: 'anotherReally',
}

const alvalues = {
  always: 'always',
  really: 'reallyYes',
  REALLy2: 'anotherReally',
}

const setInitialState = (state: AppState): AppState => {
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
            name: 'map_buckets',
            description: '',
            selected: null,
            arguments: {
              type: 'map',
              values,
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
                values,
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
        setInitialState
      )

      const dropdownButton = getByTestId('typeAhead-dropdown--button')
      fireEvent.click(dropdownButton)
      const dropdownItems = getAllByTestId('typeAhead-dropdown--item').map(
        node => node.id
      )

      expect(dropdownItems).toEqual(Object.keys(values))
    })
  })

  it('filters properly while typing in the input', () => {
    const {getByTestId, getAllByTestId} = renderWithRedux(
      <TypeAheadVariableDropdown variableID="03cbdc8a53a63000" />,
      setInitialState
    )

    const filterInput = getByTestId(
      'variable-dropdown--map_buckets--typeAhead-input'
    )

    const checkDropdown = (filterText, expectedList) => {
      fireEvent.change(filterInput, {target: {value: filterText}})
      const dropdownItems = getAllByTestId('typeAhead-dropdown--item').map(
        node => node.id
      )
      expect(dropdownItems).toEqual(Object.keys(expectedList))
    }

    // filter on the string 'f':
    checkDropdown('f', fvalues)

    // clear input, should see everything:
    checkDropdown('', values)

    // filter again by text:
    checkDropdown('e', evalues)
    checkDropdown('al', alvalues)

    // something that won't match anything
    // (see: https://testing-library.com/docs/guide-disappearance/#asserting-elements-are-not-present)
    fireEvent.change(filterInput, {target: {value: 'def23'}})
    const items = screen.queryByTestId('variable-dropdown--item')
    expect(items).toBeNull() // it doesn't exist
  })
})
