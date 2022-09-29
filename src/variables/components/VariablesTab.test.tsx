// Installed libraries
import React from 'react'
import {jest} from '@jest/globals'

// Mock State
import {renderWithReduxAndRouter} from 'src/mockState'
import {withRouterProps} from 'mocks/dummyData'
import {mockAppState} from 'src/mockAppState'

// Redux
import VariablesIndex from 'src/variables/containers/VariablesIndex'
import {normalize} from 'normalizr'
import {Organization} from 'src/client'
import {OrgEntities, RemoteDataState} from 'src/types'
import {arrayOfOrgs} from 'src/schemas'
import {fireEvent, cleanup, screen, waitFor} from '@testing-library/react'
import {
  OverlayController,
  OverlayProviderComp,
} from 'src/overlays/components/OverlayController'

import {notify} from 'src/shared/actions/notifications'
import {
  createVariableSuccess,
  deleteVariableSuccess,
  updateVariableSuccess,
} from 'src/shared/copy/notifications'

jest.mock('src/shared/components/FluxMonacoEditor', () => {
  return () => <></>
})

jest.mock('src/flows/components/ShareOverlay', () => {
  return () => <></>
})

jest.mock('src/flows', () => {
  return () => <></>
})

jest.mock('src/client/generatedRoutes', () => ({
  ...(jest.requireActual('src/client/generatedRoutes') as object),
  postVariable: jest.fn(() => {
    return {
      status: 201,
      message: 'Variable created successfully',
      data: {
        name: 'test_variable_name',
        id: 'test_variable_id',
        orgID: 'test_org_id',
        arguments: {
          type: 'map',
          values: {
            sample: 'value',
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
          values: {
            sample: 'value',
          },
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
          values: {
            sample: 'value',
          },
        },
      },
    }
  }),
}))

jest.mock('src/client/index')
jest.mock('src/shared/actions/notifications')
jest.mock('src/resources/components/GetResources')
jest.mock('src/checks/components/NewThresholdCheckEO', () => () => null)
jest.mock('src/checks/components/NewDeadmanCheckEO', () => () => null)
jest.mock('src/resources/selectors/index', () => {
  return {
    getAll: jest.fn(() => {
      return []
    }),
    getLabels: jest.fn(() => {
      return []
    }),
    getStatus: jest.fn(() => {
      return RemoteDataState.Done
    }),
  }
})

jest.mock('src/templates/api/index', () => ({
  ...(jest.requireActual('src/templates/api/index') as object),
  createVariableFromTemplate: jest.fn(() => {
    return {
      id: 'test_variable_id',
      orgID: 'test_org_id',
      name: 'test_variable_name',
      description: '',
      selected: null,
      arguments: {
        type: 'map',
        values: {
          taest: 'steet',
        },
      },
      labels: [],
    }
  }),
}))

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

let getByTestId
let store
let getByTitle

describe('the variables ui functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const renderResult = setup()

    store = renderResult.store
    getByTestId = renderResult.getByTestId
    getByTitle = renderResult.getByTitle

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
  })

  afterEach(() => {
    cleanup()
  })

  describe('the variable creation process', () => {
    it('can create a Variable of Map type', async () => {
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
      fireEvent.change(variableName, {target: {value: 'TestVariableName'}})

      const mapQueryTextArea = getByTestId('map-variable-textarea')
      fireEvent.change(mapQueryTextArea, {target: {value: 'sample,value'}})

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

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(createVariableSuccess('TestVariableName'))
    })
    it('can create a Variable of CSV type', async () => {
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
      fireEvent.change(variableName, {target: {value: 'TestVariableName'}})

      const csvQueryTextArea = getByTestId('csv-variable-textarea')
      fireEvent.change(csvQueryTextArea, {target: {value: 'sample,value'}})

      store.dispatch({
        type: 'UPDATE_VARIABLE_EDITOR_CONSTANT',
        payload: {
          type: 'constant',
          values: {
            0: 'sample',
            1: 'value',
          },
        },
      })

      const createButton = getByTestId('variable-form-save')
      expect(createButton).not.toBeDisabled()
      await waitFor(() => {
        fireEvent.click(createButton)
      })

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(createVariableSuccess('TestVariableName'))
    })
    it('can create a Variable of Query type', async () => {
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

      const queryTypeOption = getByTestId('variable-type-dropdown-query')
      fireEvent.click(queryTypeOption)

      const variableName = getByTestId('variable-name-input')
      fireEvent.change(variableName, {target: {value: 'TestVariableName'}})

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

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(createVariableSuccess('TestVariableName'))
    })
  })
  describe('the variable editing process', () => {
    it('can edit a Map variable', async () => {
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

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(updateVariableSuccess('test_variable_name'))
    })
    it('can edit a CSV variable', async () => {
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

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(updateVariableSuccess('test_variable_name'))
    })
    it('can edit a Query variable', async () => {
      const base_query_variable = getByTestId('variable-card--name base_query')
      fireEvent.click(base_query_variable)

      await waitFor(() => {
        expect(screen.queryByTitle('Edit Variable')).toBeVisible()
      })

      store.dispatch({
        type: 'UPDATE_VARIABLE_EDITOR_QUERY',
        payload: {
          type: 'query',
          values: {
            language: 'flux',
            query: 'sample flux query',
          },
        },
      })

      const submitButton = getByTitle('Submit')
      expect(submitButton).not.toBeDisabled()
      await waitFor(() => {
        fireEvent.click(submitButton)
      })

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(updateVariableSuccess('test_variable_name'))
    })
  })
  describe('the variable deleting process', () => {
    it('can delete a Map variable', async () => {
      const deleteButton = getByTestId('context-delete-variable values--button')

      await waitFor(() => {
        fireEvent.click(deleteButton)
        const confirmButton = getByTestId(
          'context-delete-variable values--confirm-button'
        )
        fireEvent.click(confirmButton)
      })

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(deleteVariableSuccess())
    })
    it('can delete a CSV variable', async () => {
      const deleteButton = getByTestId(
        'context-delete-variable csv_test_variable--button'
      )

      await waitFor(() => {
        fireEvent.click(deleteButton)
        const confirmButton = getByTestId(
          'context-delete-variable csv_test_variable--confirm-button'
        )
        fireEvent.click(confirmButton)
      })

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(deleteVariableSuccess())
    })
    it('can delete a Query variable', async () => {
      const deleteButton = getByTestId(
        'context-delete-variable base_query--button'
      )

      await waitFor(() => {
        fireEvent.click(deleteButton)
        const confirmButton = getByTestId(
          'context-delete-variable base_query--confirm-button'
        )
        fireEvent.click(confirmButton)
      })

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(deleteVariableSuccess())
    })
  })
})
