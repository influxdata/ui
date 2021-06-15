import {useEffect, useState, useCallback} from 'react'
import {getOrgsUsage} from 'src/client'
import {fromFlux} from '@influxdata/giraffe'
import {usageStatsCsv} from 'src/shared/utils/mocks/usagestats'
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {Table} from '@influxdata/giraffe'

export enum USER_PILOT_USER_STATUS {
  NEW_USER = 'NEW_USER',
  DELETED_ALL_DATA = 'DELETED_ALL_DATA',
  NON_WRITING_USER = 'NON_WRITING_USER',
  ACTIVE_USER = 'ACTIVE_USER',
  ACTIVE_WRITING_USER = 'ACTIVE_WRITING_USER',
  WRITING_NOT_READING_USER = 'WRITING_NOT_READING_USER',
}
export const getUserStatus = (table: Table): USER_PILOT_USER_STATUS[] => {
  const dataStates: USER_PILOT_USER_STATUS[] = []

  const measurement = (table.getColumn('_measurement') as string[]) ?? []

  // this looks up storage amounts to see if the user has stored data
  const storageBytes = measurement.find((v, i) => {
    return (
      measurement[i] === 'storage_usage_bucket_bytes' &&
      table.getColumn('_value', 'number')[i] > 0
    )
  })

  // This looks up requests that are POSTs to our query endpoints for writing data
  const requestInByte = measurement.find((v, i) => {
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
  const queryCount = measurement.find((v, i) => {
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

const useGetUserStatus = () => {
  const [usageDataStates, setUserStatus] = useState([])
  const org = useSelector(getOrg)

  const getUserStatusDefinition = useCallback(async () => {
    let csvToParse = ''
    const usage = await getOrgsUsage({
      orgID: org.id,
      query: {
        start: '-30d',
      },
    })
    if (usage.status === 200 && isFlagEnabled('newUsageAPI')) {
      csvToParse = usage.data
    } else {
      csvToParse = usageStatsCsv
    }
    const {table} = fromFlux(csvToParse)
    setUserStatus(getUserStatus(table))
  }, [org.id])

  useEffect(() => {
    try {
      getUserStatusDefinition()
    } catch (err) {
      event('cloud.onboarding.set_user_status_failure', {
        context: JSON.stringify(err),
      })
      setUserStatus([])
    }
  }, [getUserStatusDefinition])

  return {usageDataStates}
}

export default useGetUserStatus
