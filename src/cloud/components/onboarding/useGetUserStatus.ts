import {fromFlux} from '@influxdata/giraffe'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {Table} from '@influxdata/giraffe'
import {CLOUD} from 'src/shared/constants'
import {usageStatsCsv} from 'src/shared/utils/mocks/usageStats.mocks'

let getUsage = null

if (CLOUD) {
  getUsage = require('src/client').getOrgsUsage
}

export enum USER_PILOT_USER_STATUS {
  NEW_USER = 'NEW_USER',
  DELETED_ALL_DATA = 'DELETED_ALL_DATA',
  NON_WRITING_USER = 'NON_WRITING_USER',
  ACTIVE_USER = 'ACTIVE_USER',
  WRITING_NOT_READING_USER = 'WRITING_NOT_READING_USER',
}
export const getUserStatus = (table: Table): USER_PILOT_USER_STATUS[] => {
  const dataStates: USER_PILOT_USER_STATUS[] = []

  const measurement = (table.getColumn('_measurement') as string[]) ?? []

  // this looks up storage amounts to see if the user has stored data
  const storageBytes = measurement.find((_v, i) => {
    return (
      measurement[i] === 'storage_usage_bucket_bytes' &&
      table.getColumn('_value', 'number')[i] > 0
    )
  })

  // This looks up requests that are POSTs to our query endpoints for writing data
  const requestInByte = measurement.find((_v, i) => {
    return (
      measurement[i] === 'http_request' &&
      ['/api/v2/query', '/query'].includes(
        table.getColumn('endpoint', 'string')[i]
      ) &&
      table.getColumn('_field')[i] === 'req_bytes' &&
      table.getColumn('_value', 'number')[i] > 0
    )
  })

  // This looks up a total of query counts in general to see if the user has read values
  const queryCount = measurement.find((_v, i) => {
    return (
      measurement[i] === 'query_count' &&
      table.getColumn('_value', 'number')[i] > 0
    )
  })

  if (!storageBytes && !requestInByte) {
    dataStates.push(USER_PILOT_USER_STATUS.NEW_USER)
  }
  if (!storageBytes && requestInByte) {
    dataStates.push(USER_PILOT_USER_STATUS.DELETED_ALL_DATA)
  }
  if (storageBytes && !requestInByte) {
    dataStates.push(USER_PILOT_USER_STATUS.NON_WRITING_USER)
  }
  if (storageBytes && requestInByte && !queryCount) {
    dataStates.push(USER_PILOT_USER_STATUS.WRITING_NOT_READING_USER)
  }
  if (storageBytes && requestInByte && queryCount) {
    dataStates.push(USER_PILOT_USER_STATUS.ACTIVE_USER)
  }

  event('cloud.onboarding.set_user_status_success', {
    context: JSON.stringify(dataStates),
  })

  return dataStates
}

export const queryUsage = async (orgID: string, range?: string) => {
  let csvToParse = ''
  if (getUsage) {
    const usage = await getUsage({
      orgID,
      query: {
        start: range ?? '-30d',
      },
    })
    if (usage?.status === 200) {
      csvToParse = usage.data?.trim().replace(/\r\n/g, '\n')
    } else {
      csvToParse = usageStatsCsv
    }
  } else {
    csvToParse = usageStatsCsv
  }

  const {table} = fromFlux(csvToParse)
  return table
}

export const getUserWriteLimitHits = async (orgID: string): Promise<number> => {
  try {
    const table = await queryUsage(orgID)

    const measurement = (table.getColumn('_measurement') as string[]) ?? []

    const queryWriteLimitHits = measurement.reduce((a, b, i) => {
      if (
        b === 'event' &&
        table.getColumn('_field')[i] === 'event_type_limited_write' &&
        table.getColumn('_value', 'number')[i] > 0
      ) {
        return a + table.getColumn('_value', 'number')[i]
      } else {
        return a
      }
    }, 0)
    return queryWriteLimitHits
  } catch (err) {
    console.error(err)
  }
}

let hasCalledGetStatus = false
const handleGetUserStatus = async (orgID: string) => {
  let usageDataStates = []

  const getUserStatusDefinition = async () => {
    const tables = await queryUsage(orgID)
    if (tables) {
      usageDataStates = getUserStatus(tables)
    }
  }

  try {
    if (!hasCalledGetStatus && isFlagEnabled('newUsageAPI')) {
      await getUserStatusDefinition()
      hasCalledGetStatus = true
    }
  } catch (err) {
    console.error(err)
    event('cloud.onboarding.set_user_status_failure', {
      context: JSON.stringify(err),
    })
  }

  return {usageDataStates}
}

export default handleGetUserStatus
