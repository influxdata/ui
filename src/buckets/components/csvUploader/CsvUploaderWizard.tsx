// Libraries
import React, {useReducer, useCallback, useState, Dispatch} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  Form,
  Overlay,
  OverlayFooter,
} from '@influxdata/clockface'

// Components
import {getByID} from 'src/resources/selectors'
import CsvUploaderBody from 'src/buckets/components/csvUploader/CsvUploaderBody'
import CsvUploaderSuccess from 'src/buckets/components/csvUploader/CsvUploaderSuccess'

// Actions
import {postWrite as apiPostWrite} from 'src/client'

// Reducers
import reducer, {
  initialState,
  LineProtocolState,
} from 'src/buckets/components/lineProtocol/LineProtocol.reducer'

// Types
import {ResourceType, AppState, Bucket, WritePrecision} from 'src/types'
import {Action} from 'src/buckets/components/lineProtocol/LineProtocol.creators'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import fromFlux from 'src/shared/utils/fromFlux'

type LineProtocolContext = [LineProtocolState, Dispatch<Action>]
export const Context = React.createContext<LineProtocolContext>(null)

const getState = (bucketID: string) => (state: AppState) => {
  const bucket = getByID<Bucket>(state, ResourceType.Buckets, bucketID)
  const org = getOrg(state).name
  return {bucket: bucket?.name || '', org}
}

const MAX_CHUNK_SIZE = 1750

const CsvUploaderWizard = () => {
  const history = useHistory()
  const {bucketID, orgID} = useParams()
  const [_, setMax] = useState(0)
  const [value, setValue] = useState(0)
  const [hasFile, setHasFile] = useState(false)
  const [uploadFinished, setUploadFinished] = useState(false)
  const {bucket, org} = useSelector(getState(bucketID))

  const [state, dispatch] = useReducer(reducer, initialState())

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
        for (let i = 0; i < length; i++) {
          if (i !== 0 && i % MAX_CHUNK_SIZE === 0) {
            const resp = apiPostWrite({
              data: chunk,
              query: {org, bucket, precision: WritePrecision.Ms},
            }).then(() => {
              const percent = (++progress / counter) * 100
              setValue(Math.floor(percent))
            })
            pendingWrites.push(resp)
            counter++
            chunk = ''
          }
          measurement = table.columns['_measurement'].data[i]
          field = table.columns['_field'].data[i]
          time = table.columns['_time'].data[i] // TODO(ariel): this may need to be BigInt
          tags = columns
            .filter(col => !!table.columns[col].data[i])
            .map(col => `${col}=${table.columns[col].data[i]}`)
            .join(',')
            .trim()
            .replace(/(\r\n|\n|\r)/gm, '')
          line = `${measurement},${tags} ${field}="${field}" ${time}`
          chunk = `${line}\n${chunk}`
        }
        if (chunk) {
          const resp = apiPostWrite({
            data: chunk,
            query: {org, bucket, precision: WritePrecision.Ms},
          }).then(() => {
            const percent = (++progress / counter) * 100
            setValue(Math.floor(percent))
          })
          pendingWrites.push(resp)
          counter++
        }
        setMax(counter)
        chunk = ''
        Promise.all(pendingWrites).finally(() => {
          setUploadFinished(true)
        })
      }, 0)
    },
    [bucket, org]
  )

  return (
    <Context.Provider value={[state, dispatch]}>
      <Overlay visible={true}>
        <Overlay.Container maxWidth={800}>
          <Overlay.Header
            title="Add Data Using CSV Drag and Drop"
            onDismiss={handleDismiss}
          />
          <Form>
            <Overlay.Body style={{textAlign: 'center'}}>
              {uploadFinished ? (
                <CsvUploaderSuccess />
              ) : (
                <CsvUploaderBody
                  value={value}
                  hasFile={hasFile}
                  handleDrop={handleDrop}
                />
              )}
            </Overlay.Body>
          </Form>
          <OverlayFooter>
            <Button
              color={ComponentColor.Default}
              text="Close"
              size={ComponentSize.Medium}
              type={ButtonType.Button}
              onClick={handleDismiss}
              testID="lp-close--button"
            />
          </OverlayFooter>
        </Overlay.Container>
      </Overlay>
    </Context.Provider>
  )
}

export default CsvUploaderWizard
