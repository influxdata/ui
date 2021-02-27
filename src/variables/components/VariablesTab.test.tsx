// Installed libraries
import React from 'react'

jest.mock('src/shared/components/FluxMonacoEditor', () => {
  return () => <></>
})

jest.mock('src/client/generatedRoutes.ts', () => ({
  ...require.requireActual('src/client/generatedRoutes.ts'),
  postVariable: jest.fn(() => {
    return {
      status: 201,
      message: 'Variable created successfully',
      data: {
        name: 'Test Map Variable Name',
        id: 'test_variable_id',
        orgID: 'ec6f80303d52a018',
        arguments: {
          type: 'map',
          values: {
            please: 'work',
          },
        },
      },
    }
  }),
  patchVariable: jest.fn(() => {
    return {
      status: 200,
      message: 'Variable updated successfully',
      data: {
        name: 'test_variable_name',
        id: 'test_variable_id',
        orgID: 'test_org_id',
        arguments: {
          type: 'map',
          values: {please: 'workagain'},
        },
      },
    }
  }),
  deleteVariable: jest.fn(() => {
    return {
      status: 204,
      message: 'Variable deleted successfully',
      data: {
        name: 'test_variable_name',
        id: 'test_variable_id',
        orgID: 'test_org_id',
        arguments: {
          type: 'map',
          values: {please: 'workagain'},
        },
      },
    }
  }),
}))

jest.mock('src/client/index.ts')
jest.mock('src/shared/actions/notifications')
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
import {withRouterProps} from 'mocks/dummyData'
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

import {mocked} from 'ts-jest/utils'
import {notify} from 'src/shared/actions/notifications'
import {
  createVariableSuccess,
  deleteVariableSuccess,
  updateVariableSuccess,
} from '../../shared/copy/notifications'

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
    it('Create a Variable of Map type', async () => {
      const {getByTestId, store} = setup()

      const org = {name: 'test_org_name', id: 'test_org_id'}

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
      await waitFor(() => {
        fireEvent.click(createButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(createVariableSuccess('Test variable name'))
    })
    it('Create a Variable of CSV type', async () => {
      const {getByTestId, store} = setup()

      const org = {name: 'test_org_name', id: 'test_org_id'}

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

      const queryTypeOption = getByTestId('variable-type-dropdown-constant')
      fireEvent.click(queryTypeOption)

      const variableName = getByTestId('variable-name-input')
      fireEvent.change(variableName, {target: {value: 'Test variable name'}})

      const csvQueryTextArea = getByTestId('csv-variable-textarea')
      fireEvent.change(csvQueryTextArea, {target: {value: 'please,work'}})

      store.dispatch({
        type: 'UPDATE_VARIABLE_EDITOR_CONSTANT',
        payload: {
          type: 'constant',
          values: {
            0: 'please',
            1: 'work',
          },
        },
      })

      const createButton = getByTestId('variable-form-save')
      expect(createButton).not.toBeDisabled()
      await waitFor(() => {
        fireEvent.click(createButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(createVariableSuccess('Test variable name'))
    })
    it('Create a Variable of query type', async () => {
      return
      const {getByTestId, store} = setup()

      const org = {name: 'test_org_name', id: 'test_org_id'}

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

      const queryTypeOption = getByTestId('variable-type-dropdown-constant')
      fireEvent.click(queryTypeOption)

      const variableName = getByTestId('variable-name-input')
      fireEvent.change(variableName, {target: {value: 'Test variable name'}})

      const csvQueryTextArea = getByTestId('csv-variable-textarea')
      fireEvent.change(csvQueryTextArea, {target: {value: 'please,work'}})

      store.dispatch({
        type: 'UPDATE_VARIABLE_EDITOR_QUERY',
        payload: {
          type: 'query',
          values: {
            language: 'flux',
            query: 'sample_query',
          },
        },
      })

      const createButton = getByTestId('variable-form-save')
      expect(createButton).not.toBeDisabled()
      await waitFor(() => {
        fireEvent.click(createButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(createVariableSuccess('Test variable name'))
    })
  })
  describe('handling variable editing process', () => {
    it('Edit a Map variable', async () => {
      const {getByTestId, store, getByTitle} = setup()

      const org = {name: 'test_org_name', id: 'test_org_id'}

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

      const base_query_variable = getByTestId('variable-card--name values')

      fireEvent.click(base_query_variable)

      await waitFor(() => {
        expect(screen.queryByTitle('Edit Variable')).toBeVisible()
      })

      const mapTextArea = getByTestId('map-variable-textarea')
      fireEvent.change(mapTextArea, {target: {value: 'please,work'}})

      store.dispatch({
        type: 'UPDATE_VARIABLE_EDITOR_MAP',
        payload: {
          type: 'map',
          values: {
            please: 'work',
          },
        },
      })

      const submitButton = getByTitle('Submit')
      expect(submitButton).not.toBeDisabled()
      await waitFor(() => {
        fireEvent.click(submitButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(updateVariableSuccess('test_variable_name'))
    })
    it('Edit a CSV variable', async () => {
      const {getByTestId, store, getByTitle} = setup()

      const org = {name: 'test_org_name', id: 'test_org_id'}

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

      const base_query_variable = getByTestId(
        'variable-card--name csv_test_variable'
      )
      fireEvent.click(base_query_variable)

      await waitFor(() => {
        expect(screen.queryByTitle('Edit Variable')).toBeVisible()
      })

      const mapTextArea = getByTestId('csv-variable-textarea')
      fireEvent.change(mapTextArea, {target: {value: 'please,work'}})

      store.dispatch({
        type: 'UPDATE_VARIABLE_EDITOR_CONSTANT',
        payload: {
          type: 'constant',
          values: ['please', 'work'],
        },
      })

      const submitButton = getByTitle('Submit')
      expect(submitButton).not.toBeDisabled()
      await waitFor(() => {
        fireEvent.click(submitButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(updateVariableSuccess('test_variable_name'))
    })
  })
  describe('handling variable deleting process', () => {
    it('Delete a Map variable', async () => {
      const {store, getByTestId} = setup()

      const org = {name: 'test_org_name', id: 'test_org_id'}

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

      const deleteButton = getByTestId('context-delete-variable values')

      await waitFor(() => {
        fireEvent.click(deleteButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(deleteVariableSuccess())
    })
    it('Delete a CSV variable', async () => {
      const {store, getByTestId} = setup()

      const org = {name: 'test_org_name', id: 'test_org_id'}

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

      const deleteButton = getByTestId(
        'context-delete-variable csv_test_variable'
      )

      await waitFor(() => {
        fireEvent.click(deleteButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(deleteVariableSuccess())
    })
    it('Delete a Query variable', async () => {
      const {store, getByTestId} = setup()

      const org = {name: 'test_org_name', id: 'test_org_id'}

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

      const deleteButton = getByTestId('context-delete-variable base_query')

      await waitFor(() => {
        fireEvent.click(deleteButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(deleteVariableSuccess())
    })
  })
})
