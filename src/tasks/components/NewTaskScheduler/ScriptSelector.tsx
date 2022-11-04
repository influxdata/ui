import React, {FC} from 'react'
import {Link, useParams} from 'react-router-dom'
import {
  ComponentSize,
  Dropdown,
  EmptyState,
  IconFont,
  Form,
  Input,
  TechnoSpinner,
} from '@influxdata/clockface'

// Types
import {RemoteDataState} from 'src/types'

interface Props {
  loading: RemoteDataState
  scripts: any
  selectedScript: any
  searchTerm: string
  setSelectedScript: (script: string) => void
  searchForTerm: (searchTerm: string) => void
}

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

export const ScriptSelector: FC<Props> = ({
  loading,
  scripts,
  selectedScript,
  setSelectedScript,
  searchForTerm,
  searchTerm,
}) => {
  const {orgID} = useParams<{orgID: string}>()

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

  let list
  if (
    loading === RemoteDataState.NotStarted ||
    loading === RemoteDataState.Loading
  ) {
    list = (
      <div>
        <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
      </div>
    )
  }

  if (loading === RemoteDataState.Error) {
    list = (
      <div>
        <p>Could not get scripts</p>
      </div>
    )
  }

  if (loading === RemoteDataState.Done) {
    list = (
      <>
        {filteredScripts().map(script => (
          <Dropdown.Item
            key={script.id}
            value={script.name}
            onClick={() => setSelectedScript(script.name)}
            selected={script.name === selectedScript?.name}
          >
            {script.name}
          </Dropdown.Item>
        ))}
      </>
    )
    if (scripts.length === 0 && searchTerm) {
      list = (
        <EmptyState>
          <p>{`No Scripts match "${searchTerm}"`}</p>
        </EmptyState>
      )
    } else if (scripts.length === 0 && !searchTerm) {
      list = (
        <EmptyState>
          <p>No Scripts found</p>
        </EmptyState>
      )
    }
  }
  let buttonText = 'Select a Script'
  if (loading === RemoteDataState.Done && selectedScript?.name) {
    buttonText = selectedScript.name
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
              {buttonText}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <>
              <Dropdown.Menu onCollapse={onCollapse}>
                <Input
                  size={ComponentSize.Small}
                  icon={IconFont.Search_New}
                  value={searchTerm}
                  placeholder="Search Scripts..."
                  onChange={searchForTerm}
                />
                {list}
              </Dropdown.Menu>
            </>
          )}
        />
      </Form.Element>
      <p>
        You can create or edit Scripts in the{' '}
        <Link to={`/orgs/${orgID}/data-explorer?fluxScriptEditor`}>
          Script Editor.
        </Link>
      </p>
    </div>
  )
}
