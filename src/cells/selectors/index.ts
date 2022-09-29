import {createSelector} from 'reselect'

import {AppState, Cell} from 'src/types'

const getResources = (state: AppState) => state.resources
const getDashboardId = (_, dashboardID) => dashboardID

export const getCells = createSelector(
  getResources,
  getDashboardId,
  (resources, dashboardId): Cell[] => {
    const dashboard = resources.dashboards.byID[dashboardId]
    if (!dashboard || !dashboard.cells) {
      return []
    }

    const cellIds = dashboard.cells

    return cellIds
      .filter(cellId => Boolean(resources.cells.byID[cellId]))
      .map(cellId => resources.cells.byID[cellId])
  }
)
