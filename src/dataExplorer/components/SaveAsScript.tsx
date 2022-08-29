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
  onClear: () => void
  onClose: () => void
  type: OverlayType | null
}

const SaveAsScript: FC<Props> = ({onClose, onClear, type}) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {query, resource, save} = useContext(PersistanceContext)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const org = useSelector(getOrg)

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

  if (query.length === 0) {
    return <OpenScript onClose={onClose} />
  }

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header title={overlayTitle} onDismiss={onClose} />
      <Overlay.Body>
        {type !== OverlayType.SAVE && (
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
          onClick={onClose}
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
            text={type === OverlayType.SAVE ? 'Save' : 'Yes, Save'}
          />
        )}
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default SaveAsScript
