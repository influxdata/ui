import React, {FC, useContext, useCallback, useState} from 'react'
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
import * as api from 'src/client/scriptsRoutes'
import {useDispatch} from 'react-redux'
import {notify} from 'src/shared/actions/notifications'
import {
  scriptSaveFail,
  scriptSaveSuccess,
} from 'src/shared/copy/notifications/categories/scripts'

interface Props {
  onClose: () => void
}

const SaveAsScript: FC<Props> = ({onClose}) => {
  const dispatch = useDispatch()

  const {query, setQuery, setSelection} = useContext(PersistanceContext)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const [scriptName, setScriptName] = useState(
    `Untitled Script: ${new Date().toISOString()}`
  )
  const [description, setDescription] = useState('')

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

  const updateDescription = event => {
    setDescription(event.target.value)
  }

  const handleSaveScript = async () => {
    try {
      if (api?.postScript) {
        const resp = await api.postScript({
          data: {
            name: scriptName,
            description,
            script: query,
            language: 'flux',
          },
        })

        if (resp.status !== 201) {
          throw new Error(resp.data.message)
        }

        dispatch(notify(scriptSaveSuccess(scriptName)))
        clear()
      } else {
        alert('You are in an unsupported environment')
      }
    } catch (error) {
      dispatch(notify(scriptSaveFail(scriptName)))
      console.error({error})
    } finally {
      onClose()
    }
  }

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        title="Do you want to save your Script first?"
        onDismiss={onClose}
      />
      <Overlay.Body>
        <div className="save-script-overlay__warning-text">
          "{scriptName}" will be overwritten by a new one if you don’t save it.
        </div>
        <Form>
          <InputLabel>Save as</InputLabel>
          <Input
            className="save-script-name__input"
            name="scriptName"
            required
            type={InputType.Text}
            value={scriptName}
            onChange={updateScriptName}
          />
          <InputLabel>Description</InputLabel>
          <Input
            name="description"
            required
            type={InputType.Text}
            value={description}
            onChange={updateDescription}
          />
        </Form>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Tertiary}
          onClick={onClose}
          text="Cancel"
        />
        <Button
          color={ComponentColor.Default}
          onClick={clear}
          text="No, Delete"
        />
        {CLOUD && (
          <Button
            color={ComponentColor.Primary}
            status={
              scriptName.length === 0 || description.length === 0
                ? ComponentStatus.Disabled
                : ComponentStatus.Default
            }
            onClick={handleSaveScript}
            text="Yes, Save"
          />
        )}
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default SaveAsScript
