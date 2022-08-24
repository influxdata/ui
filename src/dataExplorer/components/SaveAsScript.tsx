import React, {FC, useContext, useCallback, useState} from 'react'
import {
  Button,
  ComponentColor,
  Input,
  InputLabel,
  InputType,
  Overlay,
} from '@influxdata/clockface'
import {QueryContext} from 'src/shared/contexts/query'
import {ResultsContext} from 'src/dataExplorer/components/ResultsContext'
import {
  PersistanceContext,
  DEFAULT_SCHEMA,
} from 'src/dataExplorer/context/persistance'
import {RemoteDataState} from 'src/types'
import './SaveAsScript.scss'

interface Props {
  onClose: () => void
}

const SaveAsScript: FC<Props> = ({onClose}) => {
  const {setQuery, setSelection} = useContext(PersistanceContext)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const [scriptName, setScriptName] = useState(new Date().toISOString())

  const clear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)
    setQuery('')
    setSelection(JSON.parse(JSON.stringify(DEFAULT_SCHEMA)))
    onClose()
  }, [onClose, setQuery, setStatus, setResult, setSelection, cancel])

  const updateScriptName = event => {
    setScriptName(event.target.value)
  }

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        title="Do you want to save your Script first?"
        onDismiss={onClose}
      />
      <Overlay.Body>
        <div className="save-script-overlay__warning-text">
          "Untitled Script: {scriptName}" will be overwritten by a new one if
          you don’t save it.
        </div>
        <InputLabel>Save as</InputLabel>
        <Input
          name="scriptName"
          type={InputType.Text}
          value={scriptName}
          onChange={updateScriptName}
        />
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Tertiary}
          onClick={onClose}
          text="Cancel"
          testID="cancel-service-confirmation--button"
        />
        <Button
          color={ComponentColor.Default}
          onClick={clear}
          text="No, Delete"
          testID="cancel-service-confirmation--button"
        />
        <Button
          color={ComponentColor.Primary}
          onClick={() => {
            alert('this is a WIP and will be connected soon')
            // TODO(ariel): hook this up
          }}
          text="Yes, Save"
          testID="cancel-service-confirmation--button"
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default SaveAsScript
