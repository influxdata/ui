// Libraries
import React, {FC, useCallback, useState} from 'react'
import {fromFlux} from '@influxdata/giraffe'
import {useHistory, useParams} from 'react-router-dom'
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
  handleDismiss: () => void
  handleDrop: (csv: string) => void
  hasFile: boolean
  uploadFinished: boolean
  value: number
}

export const DEFAULT_CONTEXT: CsvUploaderContextType = {
  handleDismiss: () => {},
  handleDrop: (_: string) => {},
  hasFile: false,
  uploadFinished: false,
  value: 0,
}

export const CsvUploaderContext = React.createContext<CsvUploaderContextType>(
  DEFAULT_CONTEXT
)

const MAX_CHUNK_SIZE = 1750

export const CsvUploaderProvider: FC<Props> = React.memo(({children}) => {
  const [value, setValue] = useState(0)
  const {bucketID, orgID} = useParams()
  const [hasFile, setHasFile] = useState(false)
  const [uploadFinished, setUploadFinished] = useState(false)

  const bucket =
    useSelector((state: AppState) =>
      getByID<Bucket>(state, ResourceType.Buckets, bucketID)
    )?.name ?? ''
  const org = useSelector(getOrg).name

  const history = useHistory()

  const handleDismiss = useCallback(() => {
    history.push(`/orgs/${orgID}/load-data/buckets`)
  }, [history, orgID])

  const handleDrop = useCallback(
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
        let precision = WritePrecision.Ms

        for (let i = 0; i < length; i++) {
          if (i !== 0 && i % MAX_CHUNK_SIZE === 0) {
            // second range
            if (`${time}`.length === 10) {
              precision = WritePrecision.S
            }
            // millisecond range
            if (`${time}`.length === 13) {
              precision = WritePrecision.Ms
            }
            // microsecond range
            if (`${time}`.length === 16) {
              precision = WritePrecision.Us
            }
            // nanosecond range
            if (`${time}`.length === 19) {
              precision = WritePrecision.Ns
            }
            const resp = postWrite({
              data: chunk,
              query: {org, bucket, precision},
            }).then(() => {
              const percent = (++progress / counter) * 100
              setValue(Math.floor(percent))
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
          line = `${measurement},${tags} ${field}="${field}" ${time}`
          chunk = `${line}\n${chunk}`
        }
        if (chunk) {
          // second range
          if (`${time}`.length === 10) {
            precision = WritePrecision.S
          }
          // millisecond range
          if (`${time}`.length === 13) {
            precision = WritePrecision.Ms
          }
          // microsecond range
          if (`${time}`.length === 16) {
            precision = WritePrecision.Us
          }
          // nanosecond range
          if (`${time}`.length === 19) {
            precision = WritePrecision.Ns
          }
          const resp = postWrite({
            data: chunk,
            query: {org, bucket, precision},
          }).then(() => {
            const percent = (++progress / counter) * 100
            setValue(Math.floor(percent))
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
        handleDismiss,
        handleDrop,
        hasFile,
        uploadFinished,
        value,
      }}
    >
      {children}
    </CsvUploaderContext.Provider>
  )
})

export default CsvUploaderProvider
