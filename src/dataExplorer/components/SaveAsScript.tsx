import React, {FC, useContext, useCallback, useState, ChangeEvent} from 'react'
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
import {useHistory} from 'react-router-dom'
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
import {useDispatch, useSelector} from 'react-redux'
import {notify} from 'src/shared/actions/notifications'
import {
  scriptSaveFail,
  scriptSaveSuccess,
} from 'src/shared/copy/notifications/categories/scripts'
import {getOrg} from 'src/organizations/selectors'

interface Props {
  onClose: () => void
  type: OverlayType | null
}

const SaveAsScript: FC<Props> = ({onClose, type}) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {setQuery, setSelection, resource, setResource, save} = useContext(
    PersistanceContext
  )
  const {cancel} = useContext(QueryContext)
  const {handleSave} = useContext(ScriptContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const org = useSelector(getOrg)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleCancel = useCallback(() => {
    onClose()
  }, [onClose, setDescription, setName])

  const handleUpdateDescription = (event: ChangeEvent<HTMLInputElement>) => {
    setResource({
      ...resource,
      data: {
        ...(resource?.data ?? {}),
        description: event.target.value,
      },
    })
  }

  const handleUpdateName = (event: ChangeEvent<HTMLInputElement>) => {
    setResource({
      ...resource,
      data: {
        ...(resource?.data ?? {}),
        name: event.target.value,
      },
    })
  }

  const clear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setSelection(JSON.parse(JSON.stringify(DEFAULT_SCHEMA)))

    history.replace(`/orgs/${org.id}/data-explorer/from/script`)

    onClose()
  }, [onClose, setQuery, setStatus, setResult, setSelection, cancel])

  const handleSaveScript = () => {
    try {
      save().then(() => {
        dispatch(notify(scriptSaveSuccess(name)))
      })
      handleSave(name, description)
    } catch (error) {
      dispatch(notify(scriptSaveFail(name)))
      console.error({error})
    } finally {
      onClose()
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
      <Overlay.Header title={overlayTitle} onDismiss={handleCancel} />
      <Overlay.Body>
        {type === OverlayType.NEW && (
          <div className="save-script-overlay__warning-text">
            "{resource?.data?.name ?? 'Untitled Script'}" will be overwritten by
            a new one if you don’t save it.
          </div>
        )}
        <Form>
          <InputLabel>Save as</InputLabel>
          <Input
            className="save-script-name__input"
            name="name"
            required
            type={InputType.Text}
            value={resource?.data?.name}
            onChange={handleUpdateName}
          />
          <InputLabel>Description</InputLabel>
          <Input
            name="description"
            required
            type={InputType.Text}
            value={resource?.data?.description}
            onChange={handleUpdateDescription}
          />
        </Form>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Tertiary}
          onClick={handleCancel}
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
              (resource?.data?.name?.length ?? 0) === 0 ||
              (resource?.data?.description?.length ?? 0) === 0
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
