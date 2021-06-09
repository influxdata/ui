import * as api from 'src/client'
import {DASHBOARD_LIMIT} from 'src/resources/constants'

import {arrayOfViews} from 'src/schemas'
import {viewsFromCells} from 'src/schemas/dashboards'
import {CellsWithViewProperties} from 'src/client'

import {View, ViewEntities} from 'src/types'
import {normalize} from 'normalizr'

export const getDashboardIDs = async (
  orgID: string
): Promise<api.Dashboard[]> => {
  const resp = await api.getDashboards({
    query: {
      orgID: orgID,
      limit: DASHBOARD_LIMIT,
    },
  })

  if (resp.status !== 200) {
    throw new Error(resp.data.message)
  }

  return resp.data.dashboards
}

export const getNewDashboardViewNames = async (dashboardID: string) => {
  const resp = await api.getDashboard({
    dashboardID,
    query: {include: 'properties'},
  })

  if (!resp) {
    return
  }

  if (resp.status !== 200) {
    throw new Error(resp.data.message)
  }

  const cellViews: CellsWithViewProperties = resp.data.cells || []
  const viewsData = viewsFromCells(cellViews, dashboardID)

  const views = normalize<View, ViewEntities, string[]>(viewsData, arrayOfViews)

  return Object.values(views?.entities.views)?.map(view => view.name) ?? []
}
