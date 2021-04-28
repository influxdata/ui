// Utils
import {runQuery} from 'src/shared/apis/query'
import {fromFlux} from '@influxdata/giraffe'
import {event} from 'src/cloud/utils/reporting'

// Constants
import {MONITORING_BUCKET} from 'src/alerting/constants'

// Types
import {CancelBox, StatusRow} from 'src/types'
import {RunQueryResult} from 'src/shared/apis/query'
import {Fields, LoadRowsOptions, Row} from 'src/eventViewer/types'

// Components
import LevelTableField from 'src/alerting/components/LevelTableField'
import TimeTableField from 'src/alerting/components/TimeTableField'
import CheckActivityTableField from 'src/checks/components/CheckActivityTableField'

export const runAlertsActivityQuery = (
  orgID: string,
  {offset, limit, since}: LoadRowsOptions
): CancelBox<StatusRow[]> => {
  const start = since ? Math.round(since / 1000) : '-1d'

  const query = `
from(bucket: "${MONITORING_BUCKET}")
  |> range(start: ${start})
  |> filter(fn: (r) => r._measurement == "statuses" and r._field == "_message")
  |> last()
  |> group()
  |> keep(columns: ["_level", "_time", "_value", "_check_name", "_check_id"])
  |> rename(columns: {
    "_time": "time",
    "_level": "level",
    "_value": "checkMessage",
    "_check_id": "checkID",
    "_check_name": "checkName",
  })
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

export const STATUSES_FIELDS: Fields = [
  {
    rowKey: 'time',
    columnName: 'time',
    columnWidth: 160,
    component: TimeTableField,
  },
  {
    rowKey: 'level',
    columnName: 'level',
    columnWidth: 50,
    component: LevelTableField,
  },
  {
    rowKey: 'checkID',
    columnName: 'ID',
    columnWidth: 150,
  },
  {
    rowKey: 'checkName',
    columnName: 'Check',
    columnWidth: 150,
    component: CheckActivityTableField,
  },
  {
    rowKey: 'checkMessage',
    columnName: 'Message',
    columnWidth: 300,
  },
]
