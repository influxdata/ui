// Installed libraries
import React from 'react'
import {createStore} from 'redux'

jest.mock('src/labels/actions/thunks.ts')
jest.mock('src/resources/components/GetResources')
jest.mock('src/resources/selectors/index.ts', () => {
  return {
    getAll: jest.fn(() => {
      return []
    }),
    getLabels: jest.fn(() => {
      return []
    }),
  }
})

// Mock State
import {renderWithReduxAndRouter} from 'src/mockState'
import {withRouterProps} from 'mocks/dummyData'
import {mockAppState} from 'src/mockAppState'

// Redux
import {variablesReducer} from '../reducers'
import VariablesIndex from '../containers/VariablesIndex'
import {normalize} from 'normalizr'
import {Organization} from '../../client'
import {OrgEntities, RemoteDataState} from '../../types'
import {arrayOfOrgs} from '../../schemas'
import {
  fireEvent,
  cleanup,
  screen, waitFor,
} from '@testing-library/react'

const defaultProps: any = {
  ...withRouterProps,
  org: '',
}

const setup = (props = defaultProps) => {
  const variablesStore = createStore(variablesReducer)

  return renderWithReduxAndRouter(
    <VariablesIndex {...props} />,
    _fakeLocalStorage => {
      const appState = {...mockAppState}
      // appState.resources.variables = variablesStore.getState()
      return appState
    }
  )
}

describe('the variable install overlay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  afterEach(() => {
    cleanup()
  })

  describe('handling the variable install process', () => {
    it('Install Query', async () => {
      const {getByTestId, store, debug} = setup()

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
      fireEvent.click(dropdownCreateButton)

      const newInstallButton = getByTestId('add-resource-dropdown--new')
      fireEvent.click(newInstallButton)

      // debug()

      // wait for the overlay to show
      await waitFor(()=>{
        expect(screen.queryByTitle('Create Variable')).toBeInTheDocument()
      })

      // const overlay = await getByTestId("create-variable-overlay-header")

      const variableTypeDropdown = getByTestId('variable-type-dropdown--button')
      fireEvent.click(variableTypeDropdown)

      debug(variableTypeDropdown)
      // const queryTypeOption = getByTestId('variable-type-dropdown-query')
      // fireEvent.click(queryTypeOption)

    })
  })
})
