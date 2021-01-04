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
import {csvUploaderNotification} from 'src/shared/copy/notifications'

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
 * This is an arbitrary number that should be capped out at 1750 due to max data sizes
 */
const MAX_CHUNK_SIZE = 1750

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

  const uploadCsv = useCallback(
    (csv: string, bucket: string) => {
      setUploadState(RemoteDataState.Loading)
      setTimeout(() => {
        try {
          const {table} = fromFlux(csv)
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
          let tags: any = ''
          let line: any = ''

          let counter = 0
          let progress = 0

          const pendingWrites = []

          for (let i = 0; i < length; i++) {
            if (i !== 0 && i % MAX_CHUNK_SIZE === 0) {
              const resp = postWrite({
                data: chunk,
                query: {org: org.name, bucket, precision: WritePrecision.Ns},
              }).then(() => {
                const percent = (++progress / counter) * 100
                setProgress(Math.floor(percent))
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
            value = table.getColumn('_value')?.[i] ?? field ?? ''
            tags = columns
              .filter(col => !!table.getColumn(col)[i])
              .map(col => `${col}=${table.getColumn(col)[i]}`)
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
            }).then(() => {
              const percent = (++progress / counter) * 100
              setProgress(Math.floor(percent))
            })
            pendingWrites.push(resp)
            counter++
          }

          chunk = ''
          Promise.all(pendingWrites).finally(() => {
            setUploadState(RemoteDataState.Done)
          })
        } catch (error) {
          reportErrorThroughHoneyBadger(error, {
            name: 'uploadCsv function',
          })
          const message = getErrorMessage(error)
          dispatch(notify(message))
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
