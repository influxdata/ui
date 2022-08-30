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
  onClear: () => void
  onClose: () => void
  type: OverlayType | null
}

const SaveAsScript: FC<Props> = ({onClose, onClear, type}) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {hasChanged, resource, setResource, save} = useContext(
    PersistanceContext
  )
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const org = useSelector(getOrg)

  const handleClose = () => {
    if (!resource?.data?.id) {
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
    setResult(null)
    onClear()

    history.replace(`/orgs/${org.id}/data-explorer/from/script`)
    if (type !== OverlayType.OPEN) {
      onClose()
    }
  }, [onClose, setStatus, setResult, cancel, history, org?.id])

  const handleSaveScript = () => {
    try {
      save().then(() => {
        dispatch(notify(scriptSaveSuccess(resource?.data?.name ?? '')))
        if (type === OverlayType.NEW) {
          clear()
        }
      })
    } catch (error) {
      dispatch(notify(scriptSaveFail(resource?.data?.name ?? '')))
      console.error({error})
    } finally {
      if (type !== OverlayType.OPEN) {
        onClose()
      }
    }
  }

  if (type == null) {
    return null
  }

  let overlayTitle = 'Save Script'

  if (type !== OverlayType.SAVE) {
    overlayTitle = 'Do you want to save your Script first?'
  }

  if (!hasChanged && type === OverlayType.OPEN) {
    return <OpenScript onCancel={handleClose} onClose={onClose} />
  }

  const displayWarning =
    (type === OverlayType.NEW && !resource?.data?.name) ||
    (type === OverlayType.OPEN && !resource?.data?.name) ||
    (type === OverlayType.OPEN && hasChanged && resource?.data?.id)

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
    <Overlay.Container maxWidth={500}>
      <Overlay.Header title={overlayTitle} onDismiss={handleClose} />
      <Overlay.Body>
        {displayWarning && (
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
            status={
              resource?.data?.id
                ? ComponentStatus.Disabled
                : ComponentStatus.Default
            }
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
          onClick={handleClose}
          text="Cancel"
        />
        {type !== OverlayType.SAVE && (
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
            text={saveText}
          />
        )}
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default SaveAsScript
