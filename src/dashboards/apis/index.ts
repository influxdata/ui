// APIs
import * as api from 'src/client'
import {postTemplatesExport} from 'src/client'

// Utils
import {downloadTextFile} from 'src/shared/utils/download'

// Types
import {Cell, View, NewView, RemoteDataState} from 'src/types'

export const getView = async (
  dashboardID: string,
  cellID: string
): Promise<View> => {
  const resp = await api.getDashboardsCellsView({dashboardID, cellID})

  if (resp.status !== 200) {
    throw new Error(resp.data.message)
  }

  return {...resp.data, dashboardID, cellID, status: RemoteDataState.Done}
}

export const updateView = async (
  dashboardID: string,
  cellID: string,
  view: NewView
): Promise<View> => {
  const resp = await api.patchDashboardsCellsView({
    dashboardID,
    cellID,
    data: view as View,
  })

  if (resp.status !== 200) {
    throw new Error(resp.data.message)
  }

  const viewWithIDs: View = {
    ...resp.data,
    dashboardID,
    cellID,
    status: RemoteDataState.Done,
  }

  return viewWithIDs
}

export const cloneUtilFunc = async (
  cells: Cell[],
  oldDashID: string,
  clonedDashID: string
) => {
  const pendingViews = cells.map(cell =>
    api
      .getDashboardsCellsView({
        dashboardID: oldDashID,
        cellID: cell.id,
      })
      .then(res => {
        return {
          ...res,
          cellID: cell.id,
        }
      })
  )
  const views = await Promise.all(pendingViews)

  if (views.length > 0 && views.some(v => v.status !== 200)) {
    throw new Error('An error occurred cloning the dashboard')
  }

  return views.map(async v => {
    const view = v.data as View
    const cell = cells.find(c => c.id === view.id)

    if (cell) {
      const newCell = await api.postDashboardsCell({
        dashboardID: clonedDashID,
        data: cell,
      })

      if (newCell.status !== 201) {
        throw new Error('An error occurred cloning the dashboard')
      }

      return api.patchDashboardsCellsView({
        dashboardID: clonedDashID,
        cellID: newCell.data.id,
        data: view,
      })
    }
  })
}

export const downloadDashboardTemplate = async (dashboard): Promise<void> => {
  const resp = await postTemplatesExport({
    data: {
      resources: [
        {
          kind: 'Dashboard',
          id: dashboard.id,
        },
      ],
    },
  })

  if (resp.status === 500) {
    throw new Error(resp.data.message)
  }

  const data = await resp.data
  downloadTextFile(JSON.stringify(data), dashboard.name, '.json', 'text/json')
}
