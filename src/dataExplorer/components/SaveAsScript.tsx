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

interface Props {
  onClose: () => void
  type: OverlayType | null
}

const SaveAsScript: FC<Props> = ({onClose, type}) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {resource, setResource, save} = useContext(PersistanceContext)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const org = useSelector(getOrg)

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

    history.replace(`/orgs/${org.id}/data-explorer/from/script`)

    onClose()
  }, [onClose, setStatus, setResult, cancel, history, org?.id])

  const handleSaveScript = () => {
    try {
      save().then(() => {
        dispatch(
          notify(scriptSaveSuccess(resource?.data?.name ?? 'Untitled Script'))
        )
        if (type === OverlayType.NEW) {
          clear()
        }
      })
    } catch (error) {
      dispatch(
        notify(scriptSaveFail(resource?.data?.name ?? 'Untitled Script'))
      )
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
      <Overlay.Header title={overlayTitle} onDismiss={onClose} />
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
          onClick={onClose}
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
