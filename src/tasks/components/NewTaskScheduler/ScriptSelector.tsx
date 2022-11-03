import React, {FC} from 'react'
import {
  TechnoSpinner,
  ComponentSize,
  Dropdown,
  EmptyState,
  IconFont,
  Input,
  Form,
} from '@influxdata/clockface'

// Types
import {RemoteDataState} from 'src/types'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'

interface Props {
  loading: RemoteDataState
  scripts: any
  selectedScript: any
  searchTerm: string
  setSelectedScript: (script: string) => void
  handleSearchTerm: (str: string) => void
}

const ScriptSelector: FC<Props> = ({
  loading,
  scripts,
  selectedScript,
  setSelectedScript,
  handleSearchTerm,
  searchTerm,
}) => {
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
        {scripts.map(script => (
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
            <Dropdown.Menu onCollapse={onCollapse}>
              <Input
                icon={IconFont.Search_New}
                size={ComponentSize.Small}
                value={searchTerm}
                placeholder="Search Scripts"
                onChange={evt => handleSearchTerm(evt.target.value)}
              />
              {list}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      <p>
        You can create or edit Scripts in the{' '}
        <SafeBlankLink href="">Script Editor.</SafeBlankLink>{' '}
      </p>
    </div>
  )
}

export default ScriptSelector
