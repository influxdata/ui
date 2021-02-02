// Libraries
import React from 'react'

// Components
import {VariableFormContext} from 'src/variables/components/VariableFormContext'

import {renderWithReduxAndRouter} from 'src/mockState'

jest.mock('src/shared/components/FluxMonacoEditor', () => () => null)
const ref = React.createRef()

const setup = (override?) => {
  const actions = {
    name: jest.fn(),
    type: jest.fn(),
    query: jest.fn(),
    map: jest.fn(),
    constant: jest.fn(),
    clear: jest.fn(),
  }
  const props = {
    initialScript: 'Hello There!',
    onCreateVariable: jest.fn(),
    onHideOverlay: jest.fn(),
    onNameUpdate: name => actions.name(name),
    onTypeUpdate: type => actions.type(type),
    onQueryUpdate: arg => actions.query(arg),
    onMapUpdate: arg => actions.map(arg),
    onConstantUpdate: arg => actions.constant(arg),
    onEditorClose: () => actions.clear(),
    ...override,
  }
  renderWithReduxAndRouter(<VariableFormContext {...props} ref={ref} />)

  return actions
}

describe('VariableFormContext', () => {
  it('should tell the store to clear on close', () => {
    // (gene: mstp): We are unable to mock mstp that this component depends on w/o enzyme
    // because it is using selectors, so we are just going to mock these props manually
    const actions = setup({
      variables: {},
      name: 'some name',
      variableType: 'constant',
      query: {
        type: 'query',
        values: {
          query: '',
          language: 'flux',
        },
      },
      map: {
        type: 'map',
        values: {},
      },
      constant: {
        type: 'constant',
        values: [],
      },
    })

    ref.current['handleHideOverlay']()

    expect(actions.clear.mock.calls.length).toBe(1)
  })
})
