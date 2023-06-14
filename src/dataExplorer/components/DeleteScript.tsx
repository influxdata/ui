import React, {FC, useContext} from 'react'
import {Button, ComponentColor, IconFont, Overlay} from '@influxdata/clockface'
import './SaveAsScript.scss'
import {CLOUD} from 'src/shared/constants'
import {PersistenceContext} from 'src/dataExplorer/context/persistence'
import {useHistory} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {deleteScriptFail} from 'src/shared/copy/notifications/categories/scripts'
import {ResultsContext} from 'src/dataExplorer/context/results'
import {RemoteDataState} from 'src/types'
import {QueryContext} from 'src/shared/contexts/query'
import {SCRIPT_EDITOR_PARAMS} from 'src/dataExplorer/components/resources'
import {ResultsViewContext} from 'src/dataExplorer/context/resultsView'

let deleteScript

if (CLOUD) {
  deleteScript = require('src/client/scriptsRoutes').deleteScript
}

interface Props {
  onBack: () => void
  onClose: () => void
}

const DeleteScript: FC<Props> = ({onBack, onClose}) => {
  const {resource} = useContext(PersistenceContext)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const {clear: clearViewOptions} = useContext(ResultsViewContext)
  const history = useHistory()
  const dispatch = useDispatch()
  const org = useSelector(getOrg)

  const handleDeleteScript = async () => {
    if (resource.data?.id) {
      try {
        const resp = await deleteScript({scriptID: resource.data.id})

        if (resp.status !== 204) {
          throw new Error(resp.data.message)
        }

        setStatus(RemoteDataState.NotStarted)
        setResult(null)
        clearViewOptions()
        cancel()
        history.replace(
          `/orgs/${org.id}/data-explorer/from/script${SCRIPT_EDITOR_PARAMS}`
        )
        onClose()
      } catch (error) {
        dispatch(notify(deleteScriptFail(resource.data?.name)))
      }
    }
  }
  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        title="Are you sure you want to delete?"
        onDismiss={onClose}
      />
      <Overlay.Body>
        "{resource.data?.name}" will be deleted. Once deleted, this action
        cannot be undone.
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Tertiary}
          onClick={onClose}
          text="cancel"
        />
        <Button color={ComponentColor.Secondary} onClick={onBack} text="back" />
        <Button
          color={ComponentColor.Danger}
          onClick={handleDeleteScript}
          text="delete"
          icon={IconFont.Trash_New}
          testID="script-query-builder--confirm-delete"
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export {DeleteScript}
