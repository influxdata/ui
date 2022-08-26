import React, {FC, useState, useCallback, useEffect} from 'react'
import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  IconFont,
  Input,
  List,
  TechnoSpinner,
  Overlay,
  EmptyState,
} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'
import './SaveAsScript.scss'
import {CLOUD} from 'src/shared/constants'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'

let getScripts

if (CLOUD) {
  getScripts = require('src/client/scriptsRoutes').getScripts
}

interface Props {
  onClose: () => void
}

const OpenScript: FC<Props> = ({onClose}) => {
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedScript, setSelectedScript] = useState<any>({})
  const history = useHistory()
  const org = useSelector(getOrg)

  const handleGetScripts = useCallback(async () => {
    try {
      if (getScripts) {
        setLoading(RemoteDataState.Loading)
        const resp = await getScripts({})

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        setScripts(resp.data.scripts)
        setLoading(RemoteDataState.Done)
      } else {
        alert('you are in an supported environment')
      }
    } catch (error) {
      setLoading(RemoteDataState.Error)
      console.error({error})
    }
  }, [getScripts])

  const handleOpenScript = () => {
    history.replace(
      `/orgs/${org.id}/data-explorer/from/script/${selectedScript.id}`
    )
    onClose()
  }

  useEffect(() => {
    handleGetScripts()
  }, [])

  if (
    loading === RemoteDataState.NotStarted ||
    loading === RemoteDataState.Loading
  ) {
    return (
      <div className="data-source--list__empty">
        <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
      </div>
    )
  }

  if (loading === RemoteDataState.Error) {
    return (
      <div className="data-source--list__empty">
        <p>Could not get scripts</p>
      </div>
    )
  }

  if (loading === RemoteDataState.Done) {
    const filteredScripts = scripts.filter(script =>
      script.name.includes(searchTerm)
    )

    let list = (
      <List>
        {filteredScripts.map(script => (
          <List.Item
            key={script.id}
            value={script.name}
            onClick={() => setSelectedScript(script)}
            selected={script.name === selectedScript?.name}
            title={script}
            wrapText={true}
          >
            {script.name}
          </List.Item>
        ))}
      </List>
    )
    if (filteredScripts.length === 0 && searchTerm) {
      list = (
        <EmptyState className="data-source--list__no-results">
          <p>{`No Scripts match "${searchTerm}"`}</p>
        </EmptyState>
      )
    } else if (filteredScripts.length === 0 && !searchTerm) {
      list = (
        <EmptyState className="data-source--list__no-results">
          <p>No Scripts found</p>
        </EmptyState>
      )
    }
    return (
      <Overlay.Container maxWidth={500}>
        <Overlay.Header title="Open Script" onDismiss={onClose} />
        <Overlay.Body>
          <Input
            className="data-source--search"
            icon={IconFont.Search_New}
            size={ComponentSize.Medium}
            value={searchTerm}
            placeholder="Search Scripts"
            onChange={evt => setSearchTerm(evt.target.value)}
          />
          <List>{list}</List>
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            color={ComponentColor.Tertiary}
            onClick={onClose}
            text="Cancel"
          />
          {CLOUD && (
            <Button
              color={ComponentColor.Primary}
              status={
                scripts.length === 0
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
              onClick={handleOpenScript}
              text="Open"
            />
          )}
        </Overlay.Footer>
      </Overlay.Container>
    )
  }

  return null
}

export default OpenScript
