import React, {FC} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {
  ComponentSize,
  Dropdown,
  Form,
  IconFont,
  Input,
} from '@influxdata/clockface'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'


export const ScriptSelector: FC = () => {
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()
  const fluxScriptEditorLink = `/orgs/${orgID}/data-explorer?fluxScriptEditor`

  const openScriptEditor = () => {
    history.push(`/orgs/${orgID}/data-explorer?fluxScriptEditor`)
  }

  const createScriptInEditor = (
    <Dropdown.Item onClick={openScriptEditor}>
      + Create Script in Editor
    </Dropdown.Item>
  )

  const dropdownButtonText = 'Select a Script'

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
                value=''
                placeholder="Search Scripts..."
                onChange={()=>{}}
              />
              <Dropdown.Menu onCollapse={onCollapse}>
                {createScriptInEditor}
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