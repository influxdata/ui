// Libraries
import React, {useReducer, useState, Dispatch} from 'react'
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
import DragAndDrop from 'src/buckets/components/lineProtocol/configure/DragAndDrop'

// Actions
import {writeLineProtocolAction} from 'src/buckets/components/lineProtocol/LineProtocol.thunks'
import {runQuery} from 'src/shared/apis/query'

// Reducers
import reducer, {
  initialState,
  LineProtocolState,
} from 'src/buckets/components/lineProtocol/LineProtocol.reducer'

// Types
import {ResourceType, AppState, Bucket} from 'src/types'
import {Action} from 'src/buckets/components/lineProtocol/LineProtocol.creators'

// Selectors
import {getOrg} from 'src/organizations/selectors'

type LineProtocolContext = [LineProtocolState, Dispatch<Action>]
export const Context = React.createContext<LineProtocolContext>(null)

const getState = (bucketID: string) => (state: AppState) => {
  const bucket = getByID<Bucket>(state, ResourceType.Buckets, bucketID)
  const org = getOrg(state).name
  return {bucket: bucket?.name || '', org}
}

const CsvUploaderWizard = () => {
  const history = useHistory()
  const {bucketID, orgID} = useParams()
  const [query, setQuery] = useState('')
  const {bucket, org} = useSelector(getState(bucketID))

  const [state, dispatch] = useReducer(reducer, initialState())
  const {body, precision} = state

  const handleDismiss = () => {
    history.push(`/orgs/${orgID}/load-data/buckets`)
  }

  const handleSubmit = () => {
    console.log('query: ', query)
    const result = runQuery(orgID, query)
    result.promise
      .then(res => {
        console.log('res: ', res)
      })
      .catch(error => console.error('error: ', error))
      .then(() => handleDismiss())
    // writeLineProtocolAction(dispatch, org, bucket, body, precision)
  }

  const handleDrop = (csv: string) => {
    console.log('csv: ', csv)
    const text = `import "csv"
  csv.from(csv: ${JSON.stringify(csv)})
  |> to(bucket: "${bucket.trim()}")`
    console.log('text: ', text)
    setQuery(text)
  }

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
              <DragAndDrop
                className="line-protocol--content"
                onSubmit={handleSubmit}
                onSetBody={handleDrop}
              />
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
