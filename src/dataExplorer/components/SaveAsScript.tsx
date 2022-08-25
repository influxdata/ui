import React, {FC, useContext, useCallback, ChangeEvent} from 'react'
import {
  Button,
  ComponentColor,
  ComponentStatus,
  Form,
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
import {CLOUD} from 'src/shared/constants'
import {ScriptContext} from 'src/dataExplorer/context/scripts'
import {OverlayType} from './FluxQueryBuilder'

interface Props {
  onClose: () => void
  type: OverlayType | null
}

const SaveAsScript: FC<Props> = ({onClose, type}) => {
  const {setQuery, setSelection} = useContext(PersistanceContext)
  const {cancel} = useContext(QueryContext)
  const {
    name,
    description,
    handleSave,
    updateName,
    updateDescription,
  } = useContext(ScriptContext)
  const {setStatus, setResult} = useContext(ResultsContext)

  const handleClose = useCallback(() => {
    updateDescription('')
    updateName(`Untitle Script: ${new Date().toISOString()}`)
    onClose()
  }, [onClose, updateDescription, updateName])

  const handleUpdateDescription = (event: ChangeEvent<HTMLInputElement>) => {
    updateDescription(event.target.value)
  }

  const handleUpdateName = (event: ChangeEvent<HTMLInputElement>) => {
    updateName(event.target.value)
  }

  const clear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)
    setQuery('')
    setSelection(JSON.parse(JSON.stringify(DEFAULT_SCHEMA)))
    handleClose()
  }, [handleClose, setQuery, setStatus, setResult, setSelection, cancel])

  const handleSaveScript = () => {
    try {
      handleSave()

      if (type === OverlayType.NEW) {
        clear()
      }
    } finally {
      handleClose()
    }
  }

  if (type == null) {
    return null
  }

  let overlayTitle = 'Save Script'

  if (type === OverlayType.NEW) {
    overlayTitle = 'Do you want to save your Script first?'
  }

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header title={overlayTitle} onDismiss={handleClose} />
      <Overlay.Body>
        {type === OverlayType.NEW && (
          <div className="save-script-overlay__warning-text">
            "{name}" will be overwritten by a new one if you don’t save it.
          </div>
        )}
        <Form>
          <InputLabel>Save as</InputLabel>
          <Input
            className="save-script-name__input"
            name="name"
            required
            type={InputType.Text}
            value={name}
            onChange={handleUpdateName}
          />
          <InputLabel>Description</InputLabel>
          <Input
            name="description"
            required
            type={InputType.Text}
            value={description}
            onChange={handleUpdateDescription}
          />
        </Form>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Tertiary}
          onClick={handleClose}
          text="Cancel"
        />
        {type === OverlayType.NEW && (
          <Button
            color={ComponentColor.Default}
            onClick={clear}
            text="No, Delete"
          />
        )}
        {CLOUD && (
          <Button
            color={ComponentColor.Primary}
            status={
              name.length === 0 || description.length === 0
                ? ComponentStatus.Disabled
                : ComponentStatus.Default
            }
            onClick={handleSaveScript}
            text={type === OverlayType.NEW ? 'Yes, Save' : 'Save'}
          />
        )}
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default SaveAsScript
