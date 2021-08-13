// Types
import {AppState, View, ResourceType, Dashboard} from 'src/types'

// Selectors
import {getByID} from 'src/resources/selectors'
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'

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

  // some types in the ViewProperties union do not have the timeFormat in view.properties (ex. GaugeViewProperties)
  // hence typescript complains, and the following complicated if-statement.
  if (
    view.properties &&
    'timeFormat' in view.properties &&
    view.properties.timeFormat !== ''
  ) {
    return view.properties.timeFormat
  }

  return DEFAULT_TIME_FORMAT
}
