// API
import {getDashboards as apiGetDashboards, getOrgs} from 'src/client'

// Types
import {Dashboard, Organization} from 'src/types'

// Utils
import {addDashboardDefaults} from 'src/schemas/dashboards'

// Metrics
import {event} from 'src/cloud/utils/reporting'

// CRUD APIs for Organizations and Organization resources
// i.e. Organization Members, Buckets, Dashboards etc

export const getDashboards = async (
  org?: Organization
): Promise<Dashboard[]> => {
  try {
    let result
    if (org) {
      result = await apiGetDashboards({query: {orgID: org.id}})
    } else {
      result = await apiGetDashboards({})
    }

    if (result.status !== 200) {
      throw new Error(result.data.message)
    }

    const dashboards = result.data.dashboards.map(d => addDashboardDefaults(d))

    return dashboards
  } catch (error) {
    console.error('Could not get buckets for org', error)
    throw error
  }
}

export const getOrg = async () => {
  try {
    const resp = await getOrgs({})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const {orgs} = resp.data

    if (Array.isArray(orgs) && orgs.length) {
      return orgs[0]
    }

    throw new Error('Orgs was not an array')
  } catch (error) {
    event('api.getOrg.fetch.error', {error})
  }
}
