import React, {FC, useContext, useCallback, ChangeEvent, useState} from 'react'
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
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {RemoteDataState} from 'src/types'
import './SaveAsScript.scss'
import {CLOUD} from 'src/shared/constants'
import {OverlayType} from './FluxQueryBuilder'
import {useDispatch, useSelector} from 'react-redux'
import {notify} from 'src/shared/actions/notifications'
import {
  scriptSaveFail,
  scriptSaveSuccess,
} from 'src/shared/copy/notifications/categories/scripts'
import {getOrg} from 'src/organizations/selectors'
import OpenScript from 'src/dataExplorer/components/OpenScript'

interface Props {
  onClose: () => void
  type: OverlayType | null
}

const SaveAsScript: FC<Props> = ({onClose, type}) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {hasChanged, resource, setResource, clearSchemaSelection, save} =
    useContext(PersistanceContext)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const [error, setError] = useState<string>()
  const org = useSelector(getOrg)

  const handleClose = () => {
    if (!resource?.data?.id) {
      // clear out any meta data that's been set by the user prior to saving
      // if they decide to cancel out of the process and close the modal
      delete resource.data?.name
      delete resource.data?.description
      setResource({
        ...resource,
        data: {
          ...(resource?.data ?? {}),
        },
      })
    }
    onClose()
  }

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
    clearSchemaSelection()
    setResult(null)

    history.replace(`/orgs/${org.id}/data-explorer/from/script`)
    if (type !== OverlayType.OPEN) {
      onClose()
    }
  }, [onClose, setStatus, setResult, cancel, history, org?.id])

  const handleSaveScript = () => {
    save()
      .then(() => {
        setError(null)
        dispatch(notify(scriptSaveSuccess(resource?.data?.name ?? '')))
        if (type !== OverlayType.OPEN) {
          onClose()
        }

        if (type === OverlayType.NEW) {
          clear()
        }
      })
      .catch(error => {
        dispatch(notify(scriptSaveFail(resource?.data?.name ?? '')))
        setError(error.message)
      })
  }

  if (type == null) {
    return null
  }

  let overlayTitle = 'Save Script'

  if (type !== OverlayType.SAVE) {
    if (resource?.data?.id && hasChanged) {
      overlayTitle = 'Do you want to save your changes first?'
    } else {
      overlayTitle = 'Do you want to save your script first?'
    }
  }

  if (!hasChanged && type === OverlayType.OPEN) {
    return <OpenScript onCancel={handleClose} onClose={onClose} />
  }

  let saveText = 'Save'

  if (resource?.data?.id) {
    if (type === OverlayType.SAVE) {
      saveText = 'Update'
    } else {
      saveText = 'Yes, Update'
    }
  } else {
    if (type === OverlayType.SAVE) {
      saveText = 'Save'
    } else {
      saveText = 'Yes, Save'
    }
  }

  return (
    <Overlay.Container maxWidth={540}>
      <Overlay.Header title={overlayTitle} onDismiss={handleClose} />
      <Overlay.Body>
        <Form>
          <InputLabel>Save as</InputLabel>
          <Input
            className="save-script-name__input"
            name="name"
            required
            type={InputType.Text}
            value={resource?.data?.name}
            onChange={handleUpdateName}
            status={error ? ComponentStatus.Error : ComponentStatus.Default}
          />
          {error && (
            <div className="cf-form--element-error save-script--error">
              {error}
            </div>
          )}
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
          onClick={handleClose}
          text="Cancel"
        />
        {type !== OverlayType.SAVE && (
          <Button
            color={ComponentColor.Default}
            onClick={clear}
            text="No, Discard"
            testID="flux-query-builder--no-save"
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
            text={saveText}
          />
        )}
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default SaveAsScript
