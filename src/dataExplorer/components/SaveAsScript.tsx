import React, {FC, useContext, useCallback} from 'react'
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
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'

interface Props {
  onClose: () => void
}

const SaveAsScript: FC<Props> = ({onClose}) => {
  const {setQuery, setSelection, resource, setResource, save} = useContext(
    PersistanceContext
  )
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const history = useHistory()
  const org = useSelector(getOrg)

  const clear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)
    setQuery('')
    setSelection(JSON.parse(JSON.stringify(DEFAULT_SCHEMA)))
    setResource(null)
    onClose()

    history.replace(`/orgs/${org.id}/data-explorer/from/script`)
  }, [onClose, setQuery, setStatus, setResult, setSelection, cancel])

  const handleRename = (name: string) => {
    resource.data.name = name
    setResource({
      ...resource,
      data: {
        ...resource.data,
        name,
      },
    })
  }

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        title="Do you want to save your Script first?"
        onDismiss={onClose}
      />
      <Overlay.Body>
        <div className="save-script-overlay__warning-text">
          "{resource?.data?.name ?? 'Untitled Script'}" will be overwritten by a
          new one if you don’t save it.
        </div>
        <InputLabel>Save as</InputLabel>
        <Input
          name="scriptName"
          type={InputType.Text}
          value={resource?.data?.name ?? ''}
          onChange={evt => handleRename(evt.target.value)}
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
            save().then(() => {
              clear()
            })
          }}
          text="Yes, Save"
          testID="cancel-service-confirmation--button"
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default SaveAsScript
