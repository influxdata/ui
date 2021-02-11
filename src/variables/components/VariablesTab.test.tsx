import React from 'react'
import {createStore} from 'redux'
import {cleanup, fireEvent, screen, waitFor} from '@testing-library/react'
import {normalize} from 'normalizr'
import {mocked} from 'ts-jest/utils'

// Mock State
import {renderWithReduxAndRouter} from 'src/mockState'
import {withRouterProps} from 'mocks/dummyData'
import {mockAppState} from 'src/mockAppState'
import {VariablesTab} from 'src/variables/components/VariablesTab'
import {variablesReducer} from 'src/variables/reducers/index'
// Types
import {Organization, RemoteDataState, OrgEntities} from 'src/types'
import {arrayOfOrgs} from 'src/schemas'

const defaultProps: any = {
  ...withRouterProps,
  notify: jest.fn(),
  org: '',
}

const setup = (props = defaultProps) => {
  const variablesStore = createStore(variablesReducer)

  return renderWithReduxAndRouter(
    <VariablesTab {...props} />,
    _fakeLocalStorage => {
      const appState = {...mockAppState}
      appState.resources.variables = variablesStore.getState()
      return appState
    }
  )
}

describe('the variable install overlay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('handling the variable install process', () => {
    it('Install Query', () => {
      const {getByTitle,input, getByTestId, store} = setup()

      const org = {name: 'zoe', id: '12345'}

      store.dispatch({
        type: 'SET_ORG',
        org: org,
      })
      const organizations = normalize<Organization, OrgEntities, string[]>(
        [org],
        arrayOfOrgs
      )
      store.dispatch({
        type: 'SET_ORGS',
        schema: organizations,
        status: RemoteDataState.Done,
      })




      const dropdownCreateButton = getByTestId('add-resource-dropdown--button')
      const newInstallButton = getByTestId('add-resource-dropdown--new')

      fireEvent.click(dropdownCreateButton)
      fireEvent.click(newInstallButton)

      expect(screen.queryByTitle(`Create Variable`)).toBeVisible()

      const dropdownOptionsButton = getByTestId('variable-type-dropdown--button')
      const queryButton = getByTestId('variable-type-dropdown-query')

      fireEvent.click(dropdownOptionsButton)
      fireEvent.click(queryButton)

      expect(screen.queryByText(`Query`)).toBeVisible()
      const inputVariableName = getByTestId('variable-name-input')
      fireEvent.change(inputVariableName, { target: { value: 'Name' } })
        expect(inputVariableName.value).toBe('Name')
    })
    const inputVariableText = getByTestId('variable-name-input')
    fireEvent.change(inputVariableText, { target: { value: 'Text' } })
      expect(inputVariableText.value).toBe('Text')
  })
  })
})
