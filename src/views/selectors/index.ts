// Types
import {AppState, View, ResourceType, Dashboard} from 'src/types'

// Selectors
import {getByID} from 'src/resources/selectors'
import {DEFAULT_TIME_FORMAT} from 'src/shared/constants'

export const getViewsForDashboard = (
  state: AppState,
  dashboardID: string
): View[] => {
  const dashboard = getByID<Dashboard>(
    state,
    ResourceType.Dashboards,
    dashboardID
  )

  const cellIDs = new Set(dashboard.cells.map(cellID => cellID))

  const views = Object.values(state.resources.views.byID).filter(
    view => view && cellIDs.has(view.cellID)
  )

  return views
}

export const getTimeFormatForView = (
  state: AppState,
  viewID: string
): string => {
  const view = getByID<View>(state, ResourceType.Views, viewID)

  let timeFormat = ''
  if ('timeFormat' in view.properties) {
    timeFormat = view.properties.timeFormat
  }

  if (timeFormat === '') {
    return DEFAULT_TIME_FORMAT
  }

  return timeFormat
}
