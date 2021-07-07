import {fromFlux} from '@influxdata/giraffe'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {Table} from '@influxdata/giraffe'
import {CLOUD} from 'src/shared/constants'
import _ from 'lodash'

let getUsage = null

if (CLOUD) {
  getUsage = require('src/client/unityRoutes').getUsage
}

export enum USER_PILOT_USER_STATUS {
  NEW_USER = 'NEW_USER',
  DELETED_ALL_DATA = 'DELETED_ALL_DATA',
  NON_WRITING_USER = 'NON_WRITING_USER',
  ACTIVE_USER = 'ACTIVE_USER',
  ACTIVE_WRITING_USER = 'ACTIVE_WRITING_USER',
  WRITING_NOT_READING_USER = 'WRITING_NOT_READING_USER',
}
export const getUserStatus = (tables: any): USER_PILOT_USER_STATUS[] => {
  const dataStates: USER_PILOT_USER_STATUS[] = []

  const {storage_gb, writes_mb, query_count} = tables
  // this looks up storage amounts to see if the user has stored data
  const storageBytes = storage_gb
    .getColumn('storage_gb', 'number')
    .find(v => v > 0)

  // This looks up requests that are POSTs to our query endpoints for writing data
  const requestInByte = writes_mb
    .getColumn('writes_mb', 'number')
    .find(v => v > 0)

  // This looks up a total of query counts in general to see if the user has read values
  const queryCount = query_count
    .getColumn('query_count', 'number')
    .find(v => v > 0)

  if (!storageBytes && !requestInByte) {
    dataStates.push(USER_PILOT_USER_STATUS.NEW_USER)
  }
  if (!storageBytes && requestInByte) {
    dataStates.push(USER_PILOT_USER_STATUS.DELETED_ALL_DATA)
  }
  if (storageBytes && requestInByte) {
    dataStates.push(USER_PILOT_USER_STATUS.ACTIVE_WRITING_USER)
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

export const queryUsage = async (vector?: string, range?: string) => {
  if (getUsage) {
    if (vector) {
      const usage = await getUsage({
        vector_name: vector,
        query: {
          range: range ?? '30d',
        },
      })
      const {table} = fromFlux(usage.data)
      return table
    } else {
      const data = await Promise.all([
        getUsage({
          vector_name: 'writes_mb',
          query: {
            range: range ?? '30d',
          },
        }),
        getUsage({
          vector_name: 'storage_gb',
          query: {
            range: range ?? '30d',
          },
        }),
        getUsage({
          vector_name: 'query_count',
          query: {
            range: range ?? '30d',
          },
        }),
      ])
      if (_.every(data, d => d.status === 200)) {
        const tablesToParse = {}
        data.forEach(d => {
          const {table} = fromFlux(d.data)
          if (table.getColumn('storage_gb')) {
            tablesToParse['storage_gb'] = table
          } else if (table.getColumn('writes_mb')) {
            tablesToParse['writes_mb'] = table
          } else if (table.getColumn('query_count')) {
            tablesToParse['query_count'] = table
          }
        })

        return tablesToParse
      }
    }
  } else {
    return {}
  }
}

export const getUserWriteLimitHits = async (): Promise<number> => {
  try {
    const table = (await queryUsage('rate_limits', '30d')) as Table

    const fieldNumbers = table.getColumn('_field') as number[]
    // const limitedWrite = table.getColumn('limited_write', 'number')

    const queryWriteLimitHits = fieldNumbers.reduce((a, _b, i) => {
      if (
        table.getColumn('_field')[i] === 'limited_write' &&
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
const handleGetUserStatus = async () => {
  let usageDataStates = []

  const getUserStatusDefinition = async () => {
    const tables = await queryUsage()
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
