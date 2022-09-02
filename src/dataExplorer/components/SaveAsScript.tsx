import React, {FC, useContext, useCallback} from 'react'
import {
  Button,
  ComponentColor,
  ComponentStatus,
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
import {RESOURCES} from './resources'
import OpenScript from 'src/dataExplorer/components/OpenScript'

interface Props {
  onClose: () => void
  type: OverlayType | null
}

const SaveAsScript: FC<Props> = ({onClose, type}) => {
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

  const clear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)

    history.replace(`/orgs/${org.id}/data-explorer/from/script`)
    if (type !== OverlayType.OPEN) {
      onClose()
    }
  }, [onClose, setStatus, setResult, cancel, history, org?.id, type])

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
        {RESOURCES[resource.type].editor
          ? React.createElement(RESOURCES[resource.type].editor)
          : null}
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
