// Libraries
import React, {FC, ChangeEvent, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'

// Components
import {
  ComponentSize,
  Dropdown,
  EmptyState,
  Form,
  IconFont,
  Input,
  RemoteDataState,
  TechnoSpinner,
} from '@influxdata/clockface'

// APIs
import {fetchScripts} from 'src/scripts/apis/index'

// Notifications
import {getScriptsFail} from 'src/shared/copy/notifications/categories/scripts'
import {notify} from 'src/shared/actions/notifications'

// Types
import {Script} from 'src/types/scripts'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

interface Props {
  selectedScript: Script
  setSelectedScript: (script: Script) => void
}

export const ScriptSelector: FC<Props> = ({
  selectedScript,
  setSelectedScript,
}) => {
  const [scripts, setScripts] = useState<Script[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [scriptsLoadingStatus, setScriptsLoadingStatus] = useState(
    RemoteDataState.NotStarted
  )
  const dispatch = useDispatch()
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()

  const fluxScriptEditorLink = `/orgs/${orgID}/data-explorer?fluxScriptEditor`

  useEffect(() => {
    setScriptsLoadingStatus(RemoteDataState.Loading)
    const getScripts = async () => {
      try {
        const scripts = await fetchScripts()
        setScripts(scripts.scripts)
        setScriptsLoadingStatus(RemoteDataState.Done)
      } catch (error) {
        setScriptsLoadingStatus(RemoteDataState.Error)
        dispatch(notify(getScriptsFail()))
      }
    }
    getScripts()
  }, [dispatch])

  const filteredScripts = () =>
    scripts.filter(script =>
      script.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    )

  const searchForTerm = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const openScriptEditor = () => {
    history.push(`/orgs/${orgID}/data-explorer?fluxScriptEditor`)
  }

  const handleSelectScript = script => {
    setSelectedScript(script)
  }

  let scriptsList

  if (
    scriptsLoadingStatus === RemoteDataState.NotStarted ||
    scriptsLoadingStatus === RemoteDataState.Loading
  ) {
    scriptsList = (
      <div>
        <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
      </div>
    )
  }

  if (scriptsLoadingStatus === RemoteDataState.Error) {
    scriptsList = (
      <div>
        <p>Could not get scripts</p>
      </div>
    )
  }

  if (scriptsLoadingStatus === RemoteDataState.Done) {
    scriptsList = (
      <>
        {filteredScripts().map(script => (
          <Dropdown.Item
            key={script.id}
            value={script.name}
            onClick={() => handleSelectScript(script)}
            selected={script.name === selectedScript?.name}
          >
            {script.name}
          </Dropdown.Item>
        ))}
      </>
    )
    if (!filteredScripts().length && searchTerm) {
      scriptsList = (
        <EmptyState>
          <p>{`No Scripts match "${searchTerm}"`}</p>
        </EmptyState>
      )
    } else if (!filteredScripts().length && !searchTerm) {
      scriptsList = (
        <EmptyState>
          <p>No Scripts found</p>
        </EmptyState>
      )
    }
  }

  let dropdownButtonText = 'Select a Script'

  if (scriptsLoadingStatus === RemoteDataState.Done && selectedScript?.name) {
    dropdownButtonText = selectedScript.name
  }

  return (
    <div className="select-script">
      <div className="create-task-titles script">Select a Script</div>
      <Form.Element label="Script" required={true} className="script-dropdown">
        <Dropdown
          button={(active, onClick) => (
            <Dropdown.Button active={active} onClick={onClick}>
              {dropdownButtonText}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <>
              <Input
                size={ComponentSize.Small}
                icon={IconFont.Search_New}
                value={searchTerm}
                placeholder="Search Scripts..."
                onChange={searchForTerm}
              />
              <Dropdown.Menu onCollapse={onCollapse}>
                <Dropdown.Item
                  onClick={openScriptEditor}
                  className="create-script-btn"
                >
                  + Create Script in Editor
                </Dropdown.Item>
                {scriptsList}
              </Dropdown.Menu>
            </>
          )}
        />
      </Form.Element>
      <p>
        You can create or edit Scripts in the{' '}
        <SafeBlankLink href={fluxScriptEditorLink}>
          Script Editor.
        </SafeBlankLink>
      </p>
    </div>
  )
}
