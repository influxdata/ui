// Libraries
import {normalize} from 'normalizr'

// Schema
import {dashboardSchema, arrayOfDashboards} from 'src/schemas'

// Reducer
import {dashboardsReducer as reducer} from 'src/dashboards/reducers/dashboards'

// Actions
import {
  setDashboard,
  setDashboards,
  removeDashboard,
  editDashboard,
} from 'src/dashboards/actions/creators'
import {removeCell} from 'src/cells/actions/creators'

// Resources
import {DEFAULT_DASHBOARD_SORT_OPTIONS} from 'src/dashboards/constants'

// Types
import {RemoteDataState, DashboardEntities, Dashboard} from 'src/types'

const initialState = () => ({
  status: RemoteDataState.Done,
  byID: {
    ['dashOne']: {
      id: 'dashOne',
      name: 'd1',
      orgID: '1',
      cells: ['cellOne'],
      status: RemoteDataState.Done,
      labels: [],
      links: {
        self: '/v2/dashboards/dashOne',
        cells: '/v2/dashboards/cells',
      },
      sortOptions: DEFAULT_DASHBOARD_SORT_OPTIONS,
    },
    ['dashTwo']: {
      id: 'dashTwo',
      name: 'd2',
      orgID: '1',
      cells: ['cellTwo'],
      status: RemoteDataState.Done,
      labels: [],
      links: {
        self: '/v2/dashboards/dashTwo',
        cells: '/v2/dashboards/cells',
      },
      sortOptions: DEFAULT_DASHBOARD_SORT_OPTIONS,
    },
  },
  allIDs: ['dashOne', 'dashTwo'],
})

describe('dashboards reducer', () => {
  it('can set the dashboards', () => {
    const schema = normalize<Dashboard, DashboardEntities, string[]>(
      [initialState().byID['dashOne']],
      arrayOfDashboards
    )

    const byID = schema.entities.dashboards
    const allIDs = schema.result

    const actual = reducer(
      undefined,
      setDashboards(RemoteDataState.Done, schema)
    )

    expect(actual.byID).toEqual(byID)
    expect(actual.allIDs).toEqual(allIDs)
  })

  it('can remove a dashboard', () => {
    const state = initialState()
    const actual = reducer(state, removeDashboard('dashOne'))

    expect(actual.allIDs.length).toEqual(1)
    expect(actual.allIDs[0]).toEqual('dashTwo')
  })

  it('can set a dashboard', () => {
    const name = 'updated name'
    const loadedDashboard = {...initialState().byID['dashOne'], name}
    const schema = normalize<Dashboard, DashboardEntities, string>(
      loadedDashboard,
      dashboardSchema
    )

    const state = initialState()

    const actual = reducer(
      state,
      setDashboard(loadedDashboard.id, RemoteDataState.Done, schema)
    )

    expect(actual.byID[loadedDashboard.id].name).toEqual(name)
  })

  it('can edit a dashboard', () => {
    const name = 'updated name'
    const loadedDashboard = {...initialState().byID['dashOne'], name}

    const schema = normalize<Dashboard, DashboardEntities, string>(
      loadedDashboard,
      dashboardSchema
    )

    const state = initialState()
    const actual = reducer(state, editDashboard(schema))

    expect(actual.byID[loadedDashboard.id].name).toEqual(name)
  })

  it('can remove a cell from a dashboard', () => {
    const state = initialState()
    const actual = reducer(
      state,
      removeCell({dashboardID: 'dashOne', id: 'cellOne'})
    )

    expect(actual.byID['dashOne'].cells).toEqual([])
  })
})
