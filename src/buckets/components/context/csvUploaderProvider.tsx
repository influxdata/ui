// Libraries
import React, {FC, useCallback, useState} from 'react'
import {fromFlux} from '@influxdata/giraffe'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Utils
import {postWrite} from 'src/client'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getByID} from 'src/resources/selectors'

// Types
import {AppState, Bucket, ResourceType, WritePrecision} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface CsvUploaderContextType {
  hasFile: boolean
  progress: number
  uploadCsv: (csv: string) => void
  uploadFinished: boolean
}

export const DEFAULT_CONTEXT: CsvUploaderContextType = {
  hasFile: false,
  progress: 0,
  uploadCsv: (_: string) => {},
  uploadFinished: false,
}

export const CsvUploaderContext = React.createContext<CsvUploaderContextType>(
  DEFAULT_CONTEXT
)

const MAX_CHUNK_SIZE = 1750

export const CsvUploaderProvider: FC<Props> = React.memo(({children}) => {
  const [progress, setProgress] = useState(0)
  const {bucketID} = useParams()
  const [hasFile, setHasFile] = useState(false)
  const [uploadFinished, setUploadFinished] = useState(false)

  const bucket =
    useSelector((state: AppState) =>
      getByID<Bucket>(state, ResourceType.Buckets, bucketID)
    )?.name ?? ''
  const org = useSelector(getOrg)

  const normalizeTimes = useCallback((time: number): BigInt => {
    const t = `${time}` + Array(19 - `${time}`.length + 1).join('0')
    return BigInt(t)
  }, [])

  const uploadCsv = useCallback(
    (csv: string) => {
      setHasFile(true)
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
          tags = columns
            .filter(col => !!table.getColumn(col)[i])
            .map(col => `${col}=${table.getColumn(col)[i]}`)
            .join(',')
            .trim()
            .replace(/(\r\n|\n|\r)/gm, '')
          line = `${measurement},${tags} ${field}="${field}" ${normalizeTimes(
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
          setUploadFinished(true)
        })
      }, 0)
    },
    [bucket, org]
  )

  return (
    <CsvUploaderContext.Provider
      value={{
        hasFile,
        progress,
        uploadCsv,
        uploadFinished,
      }}
    >
      {children}
    </CsvUploaderContext.Provider>
  )
})

export default CsvUploaderProvider
