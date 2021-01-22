// Libraries
import React, {FC, useCallback, useState} from 'react'
import {fromFlux} from '@influxdata/giraffe'
import {useSelector, useDispatch} from 'react-redux'

// Utils
import {postWrite} from 'src/client'
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {csvUploaderErrorNotification} from 'src/shared/copy/notifications'

// Types
import {RemoteDataState, WritePrecision} from 'src/types'
import {getErrorMessage} from 'src/utils/api'

export type Props = {
  children: JSX.Element
}

export interface CsvUploaderContextType {
  progress: number
  resetUploadState: () => void
  uploadCsv: (csv: string, bucket: string) => void
  uploadState: RemoteDataState
}

export const DEFAULT_CONTEXT: CsvUploaderContextType = {
  progress: 0,
  resetUploadState: () => {},
  uploadCsv: (_: string, __: string) => {},
  uploadState: RemoteDataState.NotStarted,
}

export const CsvUploaderContext = React.createContext<CsvUploaderContextType>(
  DEFAULT_CONTEXT
)

/**
 * The typical average number of concurrent requests to an API endpoint from a specific point
 * of origin is typically capped out at 6 concurrent connections. This variable is set
 * here in order to make concurrent writes to the API while limiting the number of
 * writes to the average max number of concurrent requests. More info on browser connection limitations
 * can be found here:
 *
 * https://docs.pushtechnology.com/cloud/latest/manual/html/designguide/solution/support/connection_limitations.html
 */
const CONCURRENT_REQUEST_LIMIT = 6

export const CsvUploaderProvider: FC<Props> = React.memo(({children}) => {
  const [progress, setProgress] = useState(0)
  const [uploadState, setUploadState] = useState(RemoteDataState.NotStarted)

  const dispatch = useDispatch()

  const org = useSelector(getOrg)

  const normalizeTimes = useCallback((time: number): string => {
    /**
     * Normalizes times to Nanosecond precision. This requires making
     * the numbers 19 digits long.
     */
    return `${time}` + Array(20 - `${time}`.length).join('0')
  }, [])

  const resetUploadState = (): void =>
    setUploadState(RemoteDataState.NotStarted)

  const handleError = (error: Error): void => {
    setUploadState(RemoteDataState.Error)
    reportErrorThroughHoneyBadger(error, {
      name: 'uploadCsv function',
    })
    const message = getErrorMessage(error)
    dispatch(notify(csvUploaderErrorNotification(message)))
  }

  const uploadCsv = useCallback(
    (csv: string, bucket: string) => {
      setUploadState(RemoteDataState.Loading)
      setTimeout(() => {
        try {
          const {table, error} = fromFlux(csv)
          if (!table.length || error) {
            throw new Error(
              `The CSV could not be parsed. Please make sure that CSV was in Annotated Format`
            )
          }
          const filtered = [
            /^_start$/,
            /^_stop$/,
            /^_time$/,
            /^_value/,
            /^_measurement$/,
            /^_field$/,
            /^table$/,
            /^result$/,
          ]

          const columns = table.columnKeys.filter(key => {
            return filtered.reduce((acc, curr) => {
              return acc && !curr.test(key)
            }, true)
          })

          const length = table.length

          let chunk = ''

          let measurement: any = ''
          let field: any = ''
          let time: any = ''
          let value: any = ''
          let valueColumn: string = '_value'
          let tags: any = ''
          let line: any = ''

          let counter = 0
          let progress = 0

          const pendingWrites = []

          for (let i = 0; i < length; i++) {
            if (
              i !== 0 &&
              i % Math.round(length / CONCURRENT_REQUEST_LIMIT) === 0
            ) {
              const resp = postWrite({
                data: chunk,
                query: {org: org.name, bucket, precision: WritePrecision.Ns},
              }).then(v => {
                const percent = (++progress / counter) * 100
                setProgress(Math.floor(percent))
                return v
              })
              pendingWrites.push(resp)
              counter++
              chunk = ''
            }

            measurement = table.getColumn('_measurement')?.[i] ?? undefined
            if (measurement === undefined) {
              throw new Error(
                `The CSV you're uploading is incorrectly formatted. Please make sure that a _measurement is defined before uploading it`
              )
            }
            field = table.getColumn('_field')?.[i] ?? undefined
            if (field === undefined) {
              throw new Error(
                `The CSV you're uploading is incorrectly formatted. Please make sure that a _field is defined before uploading it`
              )
            }
            time = table.getColumn('_time')?.[i] ?? Date.now()
            table.columnKeys
              // Matches _value, _value ('number'), _value ('string'), etc. to find value
              // https://github.com/influxdata/giraffe/blob/master/giraffe/src/utils/fromFlux.ts#L62
              .filter(c => /_value( \('\w*'\))?/g.test(c))
              .forEach(c => {
                if (table.getColumn(c)?.[i]) {
                  value = table.getColumn(c)[i]
                  valueColumn = c
                }
              })
            // Adds quotes to values if _value is of string type
            // https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#quotes
            value =
              table.getColumnType(valueColumn) === 'string' && value
                ? `"${value}"`
                : value
            tags = columns
              .filter(col => !!table.getColumn(col)[i])
              .map(
                col =>
                  `${col}=${
                    table.getColumnType(col) === 'string'
                      ? // Replaces special characters in accordance to Line Protocol standards
                        // https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#special-characters
                        (table.getColumn(col)[i] as string)
                          .replace(/,/g, '\\,')
                          .replace(/ /g, '\\ ')
                          .replace(/=/g, '\\=')
                      : table.getColumn(col)[i]
                  }`
              )
              .join(',')
              .trim()
              .replace(/(\r\n|\n|\r)/gm, '')

            line = `${measurement},${tags} ${field}=${value} ${normalizeTimes(
              time
            )}`

            chunk = `${line}\n${chunk}`
          }
          if (chunk) {
            const resp = postWrite({
              data: chunk,
              query: {org: org.name, bucket, precision: WritePrecision.Ns},
            }).then(v => {
              const percent = (++progress / counter) * 100
              setProgress(Math.floor(percent))
              return v
            })
            pendingWrites.push(resp)
            counter++
          }
          chunk = ''
          Promise.all(pendingWrites)
            .then(values => {
              if (values.find(v => v.status >= 400)) {
                throw new Error(
                  `Looks like some of the CSV data could not be written to the bucket. Please make sure that CSV was in Annotated Format`
                )
              }
              setUploadState(RemoteDataState.Done)
            })
            .catch(error => {
              handleError(error)
            })
        } catch (error) {
          handleError(error)
        }
      }, 0)
    },
    [dispatch, normalizeTimes, org]
  )

  return (
    <CsvUploaderContext.Provider
      value={{
        progress,
        resetUploadState,
        uploadCsv,
        uploadState,
      }}
    >
      {children}
    </CsvUploaderContext.Provider>
  )
})

export default CsvUploaderProvider
