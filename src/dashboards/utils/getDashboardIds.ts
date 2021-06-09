import * as api from 'src/client'
import {DASHBOARD_LIMIT} from 'src/resources/constants'

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
