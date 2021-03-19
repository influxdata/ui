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

jest.mock('src/client/index.ts')
jest.mock('src/shared/actions/notifications')
jest.mock('src/resources/components/GetResources')
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
    getStatus: jest.fn(() => {
      return RemoteDataState.Done
    }),
  }
})

jest.mock('src/templates/api/index.ts', () => ({
  ...require.requireActual('src/templates/api/index.ts'),
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
      fireEvent.change(variableName, {target: {value: 'Test variable name'}})

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

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(createVariableSuccess('Test variable name'))
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
      fireEvent.change(variableName, {target: {value: 'Test variable name'}})

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

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(createVariableSuccess('Test variable name'))
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
      fireEvent.change(variableName, {target: {value: 'Test variable name'}})

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

      const [notifyCallArguments] = mocked(notify).mock.calls
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

      const [notifyCallArguments] = mocked(notify).mock.calls
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

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(updateVariableSuccess('test_variable_name'))
    })
  })
  describe('the variable deleting process', () => {
    it('can delete a Map variable', async () => {
      const deleteButton = getByTestId('context-delete-variable values')

      await waitFor(() => {
        fireEvent.click(deleteButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(deleteVariableSuccess())
    })
    it('can delete a CSV variable', async () => {
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
    it('can delete a Query variable', async () => {
      const deleteButton = getByTestId('context-delete-variable base_query')

      await waitFor(() => {
        fireEvent.click(deleteButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(deleteVariableSuccess())
    })
  })
  describe('the variable importing process', () => {
    it('can import a Variable of Map type', async () => {
      const dropdownCreateButton = getByTestId('add-resource-dropdown--button')
      fireEvent.click(dropdownCreateButton)

      const importButton = getByTestId('add-resource-dropdown--import')
      fireEvent.click(importButton)

      await waitFor(() => {
        // Import Variable in the overlay and should be visible
        expect(screen.queryByTitle('Import Variable')).toBeVisible()
      })

      const selectPasteJson = getByTestId('select-group--paste-json-button')
      fireEvent.click(selectPasteJson)

      const textArea = getByTestId('import-overlay--textarea')
      await waitFor(() => {
        expect(textArea).toBeVisible()
      })

      const variableJSON = {
        meta: {
          version: '1',
          type: 'variable',
          name: 'test_var-Template',
          description: 'template created from variable: test_var',
        },
        content: {
          data: {
            type: 'variable',
            id: 'test_variable_id',
            attributes: {
              name: 'test_variable_name',
              arguments: {
                type: 'map',
                values: {
                  test: 'value',
                },
              },
              selected: null,
            },
            relationships: {
              variable: {
                data: [],
              },
              label: {
                data: [],
              },
            },
          },
          included: [],
        },
        labels: [],
      }

      const jsonStr = JSON.stringify(variableJSON).trim()

      await waitFor(() => {
        fireEvent.change(textArea, {target: {value: jsonStr}})
      })

      const createFromJsonButton = getByTestId('submit-button Variable')
      await waitFor(() => {
        fireEvent.click(createFromJsonButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(createVariableSuccess('test_variable_name'))
    })
    it('can import a Variable of CSV type', async () => {
      const dropdownCreateButton = getByTestId('add-resource-dropdown--button')
      fireEvent.click(dropdownCreateButton)

      const importButton = getByTestId('add-resource-dropdown--import')
      fireEvent.click(importButton)

      await waitFor(() => {
        // Import Variable in the overlay and should be visible
        expect(screen.queryByTitle('Import Variable')).toBeVisible()
      })

      const selectPasteJson = getByTestId('select-group--paste-json-button')
      fireEvent.click(selectPasteJson)

      const textArea = getByTestId('import-overlay--textarea')
      await waitFor(() => {
        expect(textArea).toBeVisible()
      })

      const variableJSON = {
        meta: {
          version: '1',
          type: 'variable',
          name: 'test_variable_name-Template',
          description: 'template created from variable: test_variable_name',
        },
        content: {
          data: {
            type: 'variable',
            id: 'test_variable_id',
            attributes: {
              name: 'test_variable_name',
              arguments: {
                type: 'constant',
                values: ['sample', 'value'],
              },
              selected: null,
            },
            relationships: {
              variable: {
                data: [],
              },
              label: {
                data: [],
              },
            },
          },
          included: [],
        },
        labels: [],
      }

      const jsonStr = JSON.stringify(variableJSON).trim()

      await waitFor(() => {
        fireEvent.change(textArea, {target: {value: jsonStr}})
      })

      const createFromJsonButton = getByTestId('submit-button Variable')
      await waitFor(() => {
        fireEvent.click(createFromJsonButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(createVariableSuccess('test_variable_name'))
    })
    it('can import a Variable of Query type', async () => {
      const dropdownCreateButton = getByTestId('add-resource-dropdown--button')
      fireEvent.click(dropdownCreateButton)

      const importButton = getByTestId('add-resource-dropdown--import')
      fireEvent.click(importButton)

      await waitFor(() => {
        // Import Variable in the overlay and should be visible
        expect(screen.queryByTitle('Import Variable')).toBeVisible()
      })

      const selectPasteJson = getByTestId('select-group--paste-json-button')
      fireEvent.click(selectPasteJson)

      const textArea = getByTestId('import-overlay--textarea')
      await waitFor(() => {
        expect(textArea).toBeVisible()
      })

      const variableJSON = {
        meta: {
          version: '1',
          type: 'variable',
          name: 'testqueyry-Template',
          description: 'template created from variable: testqueyry',
        },
        content: {
          data: {
            type: 'variable',
            id: 'test_variable_id',
            attributes: {
              name: 'test_variable_name',
              arguments: {
                type: 'query',
                values: {
                  query: 'testquery',
                  language: 'flux',
                },
              },
              selected: null,
            },
            relationships: {
              variable: {
                data: [],
              },
              label: {
                data: [],
              },
            },
          },
          included: [],
        },
        labels: [],
      }

      const jsonStr = JSON.stringify(variableJSON).trim()

      await waitFor(() => {
        fireEvent.change(textArea, {target: {value: jsonStr}})
      })

      const createFromJsonButton = getByTestId('submit-button Variable')
      await waitFor(() => {
        fireEvent.click(createFromJsonButton)
      })

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(createVariableSuccess('test_variable_name'))
    })
  })
})
