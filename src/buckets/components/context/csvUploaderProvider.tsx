// Libraries
import React, {FC, useCallback, useState} from 'react'
import {fromFlux} from '@influxdata/giraffe'
import {useSelector} from 'react-redux'

// Utils
import {postWrite} from 'src/client'

// Selectors
import {getOrg} from 'src/organizations/selectors'

// Types
import {RemoteDataState, WritePrecision} from 'src/types'

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
 * This is an arbitrary number that should be capped out at 1750.
 * For now, the number is set to 500 since there were significant performance issues
 * that had cropped up when writing 1750 lines on tools that took ~20s for a write query
 * to resolve
 */
const MAX_CHUNK_SIZE = 500

export const CsvUploaderProvider: FC<Props> = React.memo(({children}) => {
  const [progress, setProgress] = useState(0)
  const [uploadState, setUploadState] = useState(RemoteDataState.NotStarted)

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

          measurement = table.getColumn('_measurement')[i]
          field = table.getColumn('_field')[i]
          time = table.getColumn('_time')[i]
          value = table.getColumn('_value')[i]
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
      }, 0)
    },
    [normalizeTimes, org]
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
