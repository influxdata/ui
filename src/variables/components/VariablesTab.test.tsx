// Installed libraries
import React from 'react'

jest.mock('src/shared/components/FluxMonacoEditor', () => {
  return () => <></>
})

import {createStore} from 'redux'

jest.mock('src/resources/components/GetResources')
jest.mock(
  'src/annotations/components/overlay/CreateAnnotationStreamOverlay',
  () => () => null
)
jest.mock('src/checks/components/NewThresholdCheckEO.tsx', () => () => null)
jest.mock('src/checks/components/NewDeadmanCheckEO.tsx', () => () => null)
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
import {variables, withRouterProps} from 'mocks/dummyData'
import {mockAppState} from 'src/mockAppState'

// Redux
import VariablesIndex from '../containers/VariablesIndex'
import {normalize} from 'normalizr'
import {Organization} from '../../client'
import {OrgEntities, RemoteDataState} from '../../types'
import {arrayOfOrgs} from '../../schemas'
import {fireEvent, cleanup, screen, waitFor} from '@testing-library/react'
import {
  OverlayController,
  OverlayProviderComp,
} from '../../overlays/components/OverlayController'

const defaultProps: any = {
  ...withRouterProps,
  org: '',
}

const setup = (props = defaultProps) => {
  return renderWithReduxAndRouter(
    <>
      <OverlayProviderComp>
        <OverlayController />
        <VariablesIndex {...props} />
      </OverlayProviderComp>
    </>,
    _fakeLocalStorage => {
      const appState = {...mockAppState}
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

  describe('handling the variable creation process', () => {
    it('Create a Variable of Query type', async () => {
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

      await waitFor(() => {
        // Cancel button is unique in the overlay and should be visible
        expect(screen.queryByTitle('Cancel')).toBeVisible()
      })

      // select query
      const variableTypeDropdown = getByTestId('variable-type-dropdown--button')
      fireEvent.click(variableTypeDropdown)
      const queryTypeOption = getByTestId('variable-type-dropdown-query')
      fireEvent.click(queryTypeOption)

      // type the name
      const variableName = getByTestId('variable-name-input')
      fireEvent.change(variableName, {target: {value: 'Test variable name'}})

      const createButton = getByTestId('variable-form-save')

      debug(createButton)

      expect(createButton).toBeDisabled()
    })
    it('Create a Variable of Map type', async () => {
      const {getByTestId, store} = setup()

      const org = {name: 'TRYRYRYRYRYRYRY', id: '12345'}

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

      await waitFor(() => {
        // Cancel button is unique in the overlay and should be visible
        expect(screen.queryByTitle('Cancel')).toBeVisible()
      })

      const variableTypeDropdown = getByTestId('variable-type-dropdown--button')
      fireEvent.click(variableTypeDropdown)

      const queryTypeOption = getByTestId('variable-type-dropdown-map')
      fireEvent.click(queryTypeOption)

      const variableName = getByTestId('variable-name-input')
      fireEvent.change(variableName, {target: {value: 'Test variable name'}})

      const mapQueryTextArea = getByTestId('map-variable-textarea')
      fireEvent.change(mapQueryTextArea, {target: {value: 'please,work'}})

      store.dispatch({
        type: 'UPDATE_VARIABLE_EDITOR_MAP',
        payload: {
          type: 'map',
          values: {
            please: 'work',
          },
        },
      })

      const createButton = getByTestId('variable-form-save')
      expect(createButton).not.toBeDisabled()
      fireEvent.click(createButton)

      console.log(store.getState().resources.variables)
    })
  })
})
