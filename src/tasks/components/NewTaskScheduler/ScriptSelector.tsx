import React, {ChangeEvent, FC} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {
  ComponentSize,
  Dropdown,
  EmptyState,
  Form,
  IconFont,
  Input,
  TechnoSpinner,
} from '@influxdata/clockface'

// Types
import {RemoteDataState} from 'src/types'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

export interface Script {
  readonly id?: string
  name: string
  description?: string
  orgID: string
  script: string
  language?: string
  url?: string
  readonly createdAt?: string
  readonly updatedAt?: string
  labels?: string[]
}
interface Props {
  scripts: Script[]
  scriptsLoadingStatus: RemoteDataState
  selectedScript: any
  searchTerm: string
  setSelectedScript: (script: Script) => void
  setScriptParams: (params) => void
  searchForTerm: (event: ChangeEvent<HTMLInputElement>) => void
}

export const ScriptSelector: FC<Props> = ({
  scripts,
  scriptsLoadingStatus,
  searchForTerm,
  searchTerm,
  selectedScript,
  setSelectedScript,
  setScriptParams,
}) => {
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()
  const fluxScriptEditorLink = `/orgs/${orgID}/data-explorer?fluxScriptEditor`

  const filteredScripts = (): Script[] => {
    return scripts
      .sort((script1, script2) => {
        if (
          script1.name.toLocaleLowerCase() < script2.name.toLocaleLowerCase()
        ) {
          return -1
        }
        if (
          script1.name.toLocaleLowerCase() > script2.name.toLocaleLowerCase()
        ) {
          return 1
        }
        return 0
      })
      .filter(script =>
        script.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
      )
  }

  const openScriptEditor = () => {
    history.push(`/orgs/${orgID}/data-explorer?fluxScriptEditor`)
  }

  const createScriptInEditor = (
    <Dropdown.Item onClick={openScriptEditor}>
      + Create Script in Editor
    </Dropdown.Item>
  )

  const handleSelectScript = script => {
    setSelectedScript(script)

    // fetch script params from /api/v2/scripts/{scriptName}/params
    fetch(`/api/v2/scripts/${script.name}/params`).then(async response => {
      const params = await response.json()
      // console.log('params', params)
      setScriptParams(params.params)
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
                {createScriptInEditor}
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
