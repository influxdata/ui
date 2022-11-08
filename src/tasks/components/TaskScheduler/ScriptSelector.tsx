import React, {FC, useState, useEffect, ChangeEvent} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {
  ComponentSize,
  Dropdown,
  EmptyState,
  Form,
  IconFont,
  Input,
  TechnoSpinner,
  RemoteDataState,
} from '@influxdata/clockface'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

//
import {fetchScripts} from 'src/scripts/apis'
import {Script} from 'src/client/scriptsRoutes'

interface Props {
  selectedScript: Script
  setSelectedScript: (script: Script) => void
  setScriptParams: (params) => void
}

export const ScriptSelector: FC<Props> = ({
  selectedScript,
  setScriptParams,
  setSelectedScript,
}) => {
  const [scripts, setScripts] = useState<Script[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [scriptsLoadingStatus, setScriptsLoadingStatus] = useState(
    RemoteDataState.NotStarted
  )
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()
  const fluxScriptEditorLink = `/orgs/${orgID}/data-explorer?fluxScriptEditor`

  useEffect(() => {
    setScriptsLoadingStatus(RemoteDataState.Loading)
    const getScripts = async () => {
      try {
        const scripts = await fetchScripts()
        setScripts(scripts)
        setScriptsLoadingStatus(RemoteDataState.Done)
      } catch (error) {
        setScriptsLoadingStatus(RemoteDataState.Error)
        // TODO: how to handle error: honeybadger?
        // handle error here or in apis file?
      }
    }
    getScripts()
  }, [])

  // TODO: change function name
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

    // fetch script params from /api/v2/scripts/{scriptName}/params
    fetch(`/api/v2/scripts/${script.name}/params`).then(async response => {
      const scriptParameters = await response.json() // {params: {mybucket: string}}

      const data = [scriptParameters.params] // [{mybucket: string}]
  
      const formatParamsObj = Object.keys(data[0]).map(key => ({
          name: key,
          value: ""
      }))
      // formatParamsObj = [{name: mybucket, value: ""}]
        setScriptParams(formatParamsObj)
      })
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
            <Dropdown.Button
              active={active}
              onClick={onClick}
              testID="variable-type-dropdown--button"
            >
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
                <Dropdown.Item onClick={openScriptEditor}>
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
