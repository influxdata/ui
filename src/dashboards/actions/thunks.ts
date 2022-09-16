// Libraries
import {normalize} from 'normalizr'
import {Dispatch} from 'react'
import {push} from 'connected-react-router'
import {get} from 'lodash'

// APIs
import * as dashAPI from 'src/dashboards/apis'
import * as api from 'src/client'
import {createResourceFromPkgerTemplate} from 'src/templates/api'
import {createCellWithView} from 'src/cells/actions/thunks'

// Schemas
import {
  dashboardSchema,
  arrayOfDashboards,
  labelSchema,
  arrayOfViews,
  arrayOfCells,
} from 'src/schemas'
import {viewsFromCells} from 'src/schemas/dashboards'

// Actions
import {
  notify,
  PublishNotificationAction,
} from 'src/shared/actions/notifications'
import {
  deleteTimeRange,
  updateTimeRangeFromQueryParams,
} from 'src/dashboards/actions/ranges'
import {getVariables, hydrateVariables} from 'src/variables/actions/thunks'
import {checkDashboardLimits} from 'src/cloud/actions/limits'
import {setCells, Action as CellAction} from 'src/cells/actions/creators'
import {
  setViewsAndCells,
  setViews,
  Action as ViewAction,
} from 'src/views/actions/creators'
import {updateViewAndVariables} from 'src/views/actions/thunks'
import {setLabelOnResource} from 'src/labels/actions/creators'
import * as creators from 'src/dashboards/actions/creators'
import {updateView} from 'src/views/actions/thunks'
import {setNoteState, Action as NoteAction} from 'src/dashboards/actions/notes'
import {createView} from 'src/views/helpers'

// Utils
import {getSaveableView} from 'src/timeMachine/selectors'
import {setCloneName} from 'src/utils/naming'
import {isLimitError} from 'src/cloud/utils/limits'
import {getOrg} from 'src/organizations/selectors'
import {getByID, getStatus} from 'src/resources/selectors'

// Constants
import * as copy from 'src/shared/copy/notifications'
import {DEFAULT_DASHBOARD_NAME} from 'src/dashboards/constants/index'
import {DASHBOARD_LIMIT} from 'src/resources/constants'

// Types
import {
  Dashboard,
  GetState,
  View,
  Cell,
  Label,
  RemoteDataState,
  DashboardEntities,
  ViewEntities,
  ResourceType,
  LabelEntities,
  NoteEditorMode,
  MarkdownViewProperties,
} from 'src/types'
import {CellsWithViewProperties} from 'src/client'

type Action = creators.Action

// Thunks
export const createDashboard =
  () =>
  async (dispatch, getState: GetState): Promise<void> => {
    try {
      const org = getOrg(getState())

      const newDashboard = {
        name: DEFAULT_DASHBOARD_NAME,
        cells: [],
        orgID: org.id,
      }

      const resp = await api.postDashboard({data: newDashboard})

      if (resp.status !== 201) {
        throw new Error(resp.data.message)
      }

      const normDash = normalize<Dashboard, DashboardEntities, string>(
        resp.data,
        dashboardSchema
      )

      await dispatch(
        creators.setDashboard(resp.data.id, RemoteDataState.Done, normDash)
      )

      dispatch(push(`/orgs/${org.id}/dashboards/${resp.data.id}`))
      dispatch(checkDashboardLimits())
    } catch (error) {
      console.error(error)

      if (isLimitError(error)) {
        dispatch(notify(copy.resourceLimitReached('dashboards')))
      } else {
        dispatch(notify(copy.dashboardCreateFailed()))
      }
    }
  }

export const cloneDashboard =
  (dashboardID: string, dashboardName: string) =>
  async (dispatch, getState: GetState): Promise<void> => {
    try {
      const state = getState()

      const org = getOrg(state)

      const getResp = await api.getDashboard({
        dashboardID,
        query: {include: 'properties'},
      })

      if (getResp.status !== 200) {
        throw new Error(getResp.data.message)
      }

      const {entities, result} = normalize<
        Dashboard,
        DashboardEntities,
        string
      >(getResp.data, dashboardSchema)

      const dash: Dashboard = entities.dashboards[result]
      const cells = Object.values<Cell>(entities.cells || {})

      const postResp = await api.postDashboard({
        data: {
          orgID: org.id,
          name: setCloneName(dashboardName),
          description: dash.description || '',
        },
      })

      if (postResp.status !== 201) {
        throw new Error(postResp.data.message)
      }

      const normDash = normalize<Dashboard, DashboardEntities, string>(
        postResp.data,
        dashboardSchema
      )

      await dispatch(
        creators.setDashboard(postResp.data.id, RemoteDataState.Done, normDash)
      )

      const pendingLabels = getResp.data.labels.map(l =>
        api.postDashboardsLabel({
          dashboardID: postResp.data.id,
          data: {labelID: l.id},
        })
      )

      const mappedLabels = await Promise.all(pendingLabels)

      if (mappedLabels.length > 0 && mappedLabels.some(l => l.status !== 201)) {
        throw new Error(
          'An error occurred cloning the labels for this dashboard'
        )
      }

      const clonedDashboardID = postResp.data.id

      const clonedViews = await dashAPI.cloneUtilFunc(
        cells,
        dashboardID,
        clonedDashboardID
      )

      const newViews = await Promise.all(clonedViews)

      if (newViews.length > 0 && newViews.some(v => v.status !== 200)) {
        throw new Error('An error occurred cloning the dashboard')
      }

      dispatch(checkDashboardLimits())
      dispatch(push(`/orgs/${org.id}/dashboards/${postResp.data.id}`))
    } catch (error) {
      console.error(error)
      if (isLimitError(error)) {
        dispatch(notify(copy.resourceLimitReached('dashboards')))
      } else {
        dispatch(notify(copy.dashboardCreateFailed()))
      }
    }
  }

type FullAction = Action | CellAction | ViewAction

export const getDashboards =
  () =>
  async (dispatch: Dispatch<FullAction>, getState: GetState): Promise<void> => {
    try {
      const {setDashboards} = creators

      const state = getState()
      if (
        getStatus(state, ResourceType.Dashboards) === RemoteDataState.NotStarted
      ) {
        dispatch(setDashboards(RemoteDataState.Loading))
      }

      const org = getOrg(state)

      const resp = await api.getDashboards({
        query: {
          orgID: org.id,
          limit: DASHBOARD_LIMIT,
        },
      })

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const dashboards = normalize<Dashboard, DashboardEntities, string[]>(
        resp.data.dashboards,
        arrayOfDashboards
      )

      dispatch(setDashboards(RemoteDataState.Done, dashboards))

      if (!dashboards.result.length) {
        return
      }

      const normalizedCellsArray = []
      const normalizedViewsArray = []

      setTimeout(() => {
        Object.values(dashboards.entities.dashboards)
          .map(dashboard => {
            return {
              id: dashboard.id,
              cells: dashboard.cells.map(
                cell => dashboards.entities.cells[cell]
              ),
            }
          })
          .forEach(entity => {
            const viewsData = viewsFromCells(entity.cells, entity.id)

            const normViews = normalize<View, ViewEntities, string[]>(
              viewsData,
              arrayOfViews
            )

            normalizedViewsArray.push(normViews)

            const normCells = normalize<Dashboard, DashboardEntities, string[]>(
              entity.cells,
              arrayOfCells
            )

            normalizedCellsArray.push(normCells)
          })
        dispatch(
          setViewsAndCells(
            RemoteDataState.Done,
            normalizedCellsArray,
            normalizedViewsArray
          )
        )
      }, 0)
    } catch (error) {
      dispatch(creators.setDashboards(RemoteDataState.Error))
      console.error(error)
      throw error
    }
  }

export const createDashboardFromTemplate =
  (template: api.Template) => async (dispatch, getState: GetState) => {
    try {
      const org = getOrg(getState())

      await createResourceFromPkgerTemplate(template, org.id)

      const resp = await api.getDashboards({query: {orgID: org.id}})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const dashboards = normalize<Dashboard, DashboardEntities, string[]>(
        resp.data.dashboards,
        arrayOfDashboards
      )

      dispatch(creators.setDashboards(RemoteDataState.Done, dashboards))
      dispatch(notify(copy.importDashboardSucceeded()))
      dispatch(checkDashboardLimits())
    } catch (error) {
      if (isLimitError(error)) {
        dispatch(notify(copy.resourceLimitReached('dashboards')))
      } else {
        dispatch(notify(copy.importDashboardFailed(error)))
      }
    }
  }

export const deleteDashboard =
  (dashboardID: string, name: string) =>
  async (dispatch): Promise<void> => {
    dispatch(creators.removeDashboard(dashboardID))
    dispatch(deleteTimeRange(dashboardID))

    try {
      const resp = await api.deleteDashboard({dashboardID})

      if (resp.status !== 204) {
        throw new Error(resp.data.message)
      }

      dispatch(notify(copy.dashboardDeleted(name)))
      dispatch(checkDashboardLimits())
    } catch (error) {
      dispatch(notify(copy.dashboardDeleteFailed(name, error.message)))
    }
  }

export const getDashboard =
  (dashboardID: string, controller?: AbortController) =>
  async (dispatch, getState: GetState): Promise<void> => {
    try {
      dispatch(creators.setDashboard(dashboardID, RemoteDataState.Loading))

      // Fetch the dashboard, views, and all variables a user has access to
      const [resp] = await Promise.all([
        api.getDashboard(
          {dashboardID, query: {include: 'properties'}},
          {signal: controller?.signal}
        ),
        dispatch(getVariables(controller)),
      ])

      if (!resp) {
        return
      }

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const normDash = normalize<Dashboard, DashboardEntities, string>(
        resp.data,
        dashboardSchema
      )

      const cellViews: CellsWithViewProperties = resp.data.cells || []
      const viewsData = viewsFromCells(cellViews, dashboardID)
      setTimeout(() => {
        const normCells = normalize<Dashboard, DashboardEntities, string[]>(
          cellViews,
          arrayOfCells
        )

        dispatch(setCells(dashboardID, RemoteDataState.Done, normCells))
        const normViews = normalize<View, ViewEntities, string[]>(
          viewsData,
          arrayOfViews
        )

        dispatch(setViews(RemoteDataState.Done, normViews))
        // Now that all the necessary state has been loaded, set the dashboard
        dispatch(
          creators.setDashboard(dashboardID, RemoteDataState.Done, normDash)
        )
        dispatch(updateTimeRangeFromQueryParams(dashboardID))

        // prevent all the variables from being hydrated if the dashboard is empty
        if (cellViews.length > 0) {
          const skipCache = true
          dispatch(hydrateVariables(skipCache, controller))
        }
      }, 0)
    } catch (error) {
      if (error.name === 'AbortError') {
        return
      }

      const org = getOrg(getState())
      dispatch(push(`/orgs/${org.id}/dashboards-list`))
      dispatch(notify(copy.dashboardGetFailed(dashboardID, error.message)))
      return
    }
  }

export const updateDashboard =
  (id: string, updates: Partial<Dashboard>) =>
  async (
    dispatch: Dispatch<creators.Action | PublishNotificationAction>,
    getState: GetState
  ): Promise<void> => {
    const state = getState()

    const currentDashboard = getByID<Dashboard>(
      state,
      ResourceType.Dashboards,
      id
    )

    const dashboard = {...currentDashboard, ...updates}

    try {
      const resp = await api.patchDashboard({
        dashboardID: dashboard.id,
        data: {
          name: dashboard.name,
          description: dashboard.description,
        },
      })

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const updatedDashboard = normalize<Dashboard, DashboardEntities, string>(
        resp.data,
        dashboardSchema
      )

      dispatch(creators.editDashboard(updatedDashboard))
    } catch (error) {
      console.error(error)
      dispatch(notify(copy.dashboardUpdateFailed()))
    }
  }

export const addDashboardLabel =
  (dashboardID: string, label: Label) =>
  async (dispatch: Dispatch<Action | PublishNotificationAction>) => {
    try {
      const resp = await api.postDashboardsLabel({
        dashboardID,
        data: {labelID: label.id},
      })

      if (resp.status !== 201) {
        throw new Error(resp.data.message)
      }

      const normLabel = normalize<Label, LabelEntities, string>(
        resp.data.label,
        labelSchema
      )

      dispatch(setLabelOnResource(dashboardID, normLabel))
    } catch (error) {
      console.error(error)
      dispatch(notify(copy.addDashboardLabelFailed()))
    }
  }

export const removeDashboardLabel =
  (dashboardID: string, label: Label) =>
  async (dispatch: Dispatch<Action | PublishNotificationAction>) => {
    try {
      const resp = await api.deleteDashboardsLabel({
        dashboardID,
        labelID: label.id,
      })

      if (resp.status !== 204) {
        throw new Error(resp.data.message)
      }

      dispatch(creators.removeDashboardLabel(dashboardID, label.id))
    } catch (error) {
      console.error(error)
      dispatch(notify(copy.removedDashboardLabelFailed()))
    }
  }

export const saveVEOView =
  (dashboardID: string) =>
  async (dispatch, getState: GetState): Promise<void> => {
    const view = getSaveableView(getState())

    try {
      if (view.id) {
        await dispatch(updateViewAndVariables(dashboardID, view))
      } else {
        await dispatch(createCellWithView(dashboardID, view))
      }
    } catch (error) {
      console.error(error)
      dispatch(notify(copy.cellAddFailed(error.message)))
      throw error
    }
  }

export const loadNote =
  (id: string) => (dispatch: Dispatch<NoteAction>, getState: GetState) => {
    const state = getState()
    const currentViewState = getByID<View>(state, ResourceType.Views, id)

    if (!currentViewState) {
      return
    }

    const view = currentViewState

    const note: string = get(view, 'properties.note', '')
    const showNoteWhenEmpty: boolean = get(
      view,
      'properties.showNoteWhenEmpty',
      false
    )

    const initialState = {
      viewID: view.id,
      note,
      showNoteWhenEmpty,
      mode: NoteEditorMode.Editing,
    }

    dispatch(setNoteState(initialState))
  }

export const updateViewNote =
  (id: string) =>
  (
    dispatch: Dispatch<NoteAction | ReturnType<typeof updateView>>,
    getState: GetState
  ) => {
    const state = getState()
    const {note, showNoteWhenEmpty} = state.noteEditor
    const view = getByID<View>(state, ResourceType.Views, id)

    if (view.properties.type === 'check') {
      throw new Error(
        `view type "${view.properties.type}" does not support notes`
      )
    }

    const updatedView = {
      ...view,
      properties: {...view.properties, note, showNoteWhenEmpty},
    }

    return dispatch(updateView(view.dashboardID, updatedView))
  }

export const createNoteCell =
  (dashboardID: string) =>
  (
    dispatch: Dispatch<NoteAction | ReturnType<typeof createCellWithView>>,
    getState: GetState
  ) => {
    const dashboard = getByID<Dashboard>(
      getState(),
      ResourceType.Dashboards,
      dashboardID
    )

    if (!dashboard) {
      throw new Error(`could not find dashboard with id "${dashboardID}"`)
    }

    const {note} = getState().noteEditor
    const view = createView<MarkdownViewProperties>('markdown')

    view.properties.note = note

    return dispatch(createCellWithView(dashboard.id, view))
  }
