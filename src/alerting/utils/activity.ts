// Utils
import {runQuery} from 'src/shared/apis/query'
import {fromFlux} from '@influxdata/giraffe'
import {event} from 'src/cloud/utils/reporting'

// Constants
import {MONITORING_BUCKET} from 'src/alerting/constants'

// Types
import {CancelBox, CheckIDsMap, StatusRow} from 'src/types'
import {RunQueryResult} from 'src/shared/apis/query'
import {LoadRowsOptions, Row} from 'src/types'

export const runAlertsActivityQuery = (
  orgID: string,
  checkIDs: CheckIDsMap,
  {offset, limit, since}: LoadRowsOptions
): CancelBox<StatusRow[]> => {
  const start = since ? Math.round(since / 1000) : '-1d'

  // Empty checkIDs set will result in 0 records being fetched by the following query
  const checks = Object.keys(checkIDs).join('", "')
  const query = `
from(bucket: "${MONITORING_BUCKET}")
  |> range(start: ${start})
  |> filter(fn: (r) => r._measurement == "statuses" and r._field == "_message")
  |> filter(fn: (r) => contains(value: r._check_id, set: ["${checks}"]))
  |> group(columns: ["_check_name", "_check_id"])
  |> last()
  |> keep(columns: ["_level", "_time", "_value", "_check_name", "_check_id"])
  |> rename(columns: {
    "_time": "time",
    "_level": "level",
    "_value": "checkMessage",
    "_check_id": "checkID",
    "_check_name": "checkName",
  })
  |> group()
  |> sort(columns: ["time"], desc: true)
  |> limit(n: ${limit}, offset: ${offset})
`

  event('runQuery', {context: 'runAlertsActivityQuery'})

  return processResponse(runQuery(orgID, query)) as CancelBox<StatusRow[]>
}

export const processResponse = ({
  promise: queryPromise,
  cancel,
}: CancelBox<RunQueryResult>): CancelBox<Row[]> => {
  const promise = queryPromise.then<Row[]>(resp => {
    if (resp.type !== 'SUCCESS') {
      return Promise.reject(new Error(resp.message))
    }

    const {table} = fromFlux(resp.csv)
    const rows: Row[] = []

    for (let i = 0; i < table.length; i++) {
      const row = table.columnKeys.reduce((accumulator, current) => {
        accumulator[current] = table.getColumn(current)[i]

        return accumulator
      }, {})

      rows.push(row)
    }

    return rows
  })

  return {
    promise,
    cancel,
  }
}
