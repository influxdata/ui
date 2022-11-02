import React, {FC, useContext, useState, useCallback, useEffect} from 'react'
import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  IconFont,
  Input,
  Dropdown,
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
import {ResultsContext} from 'src/dataExplorer/components/ResultsContext'
import {QueryContext} from 'src/shared/contexts/query'

let getScripts

if (CLOUD) {
  getScripts = require('src/client/scriptsRoutes').getScripts
}

interface Props {
  onCancel: () => void
  onClose: () => void
}

const OpenScript: FC<Props> = ({onCancel, onClose}) => {
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [searchTerm, setSearchTerm] = useState('')
  const {setStatus, setResult} = useContext(ResultsContext)
  const {cancel} = useContext(QueryContext)
  const [selectedScript, setSelectedScript] = useState<any>({})
  const history = useHistory()
  const org = useSelector(getOrg)

  const handleGetScripts = useCallback(async () => {
    try {
      if (getScripts) {
        setLoading(RemoteDataState.Loading)
        const resp = await getScripts({query: {limit: 250, name}})

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
  }, [])

  const handleSearchTerm = (name: string) => {
    setSearchTerm(name)
  }

  const handleOpenScript = () => {
    setStatus(RemoteDataState.NotStarted)
    setResult(null)
    cancel()
    history.replace(
      `/orgs/${org.id}/data-explorer/from/script/${selectedScript.id}`
    )
    onClose()
  }

  useEffect(() => {
    handleGetScripts()
  }, [handleGetScripts])

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
      <Overlay.Container maxWidth={500}>
        <Overlay.Header title="Open Script" onDismiss={onCancel} />
        <div className="data-source--list__empty">
          <p>Could not get scripts</p>
        </div>
      </Overlay.Container>
    )
  }

  const filteredScripts = scripts.filter(script => {
    return script.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading === RemoteDataState.Done) {
    let list = (
      <>
        {filteredScripts.map(script => (
          <Dropdown.Item
            key={script.id}
            value={script.name}
            onClick={() => setSelectedScript(script)}
            selected={script.name === selectedScript?.name}
          >
            {script.name}
          </Dropdown.Item>
        ))}
      </>
    )
    if (filteredScripts.length === 0 && searchTerm) {
      list = (
        <EmptyState className="data-source--list__no-results">
          <p>{`No Scripts match "${searchTerm}"`}</p>
        </EmptyState>
      )
    } else if (scripts.length === 0 && !searchTerm) {
      list = (
        <EmptyState className="data-source--list__no-results">
          <p>No Scripts found</p>
        </EmptyState>
      )
    }
    return (
      <Overlay.Container maxWidth={500}>
        <Overlay.Header title="Open Script" onDismiss={onCancel} />
        <Overlay.Body>
          <Input
            className="data-source--search"
            icon={IconFont.Search_New}
            size={ComponentSize.Medium}
            value={searchTerm}
            placeholder="Search Scripts"
            onChange={evt => handleSearchTerm(evt.target.value)}
          />
          <Dropdown.Menu className="open-script__menu-items" maxHeight={300}>
            {list}
          </Dropdown.Menu>
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            color={ComponentColor.Tertiary}
            onClick={onCancel}
            text="Cancel"
          />
          {CLOUD && (
            <Button
              color={ComponentColor.Primary}
              status={
                scripts.length === 0 || Object.keys(selectedScript).length === 0
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
