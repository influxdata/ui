import React, {FC} from 'react'
import {TYPE_DEFINITIONS} from 'src/flows/pipes/Visualization'

// Components
import {Dropdown, DropdownMenuTheme} from '@influxdata/clockface'
import {ComponentStatus} from 'src/clockface'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export interface Props {
  viewType: string
  onUpdateType: (type: string) => void
}

const ViewTypeDropdown: FC<Props> = ({viewType, onUpdateType}) => {
  const items = Object.values(TYPE_DEFINITIONS)
    .filter(def => !def.disabled)
    .filter(def => !def.featureFlag || isFlagEnabled(def.featureFlag))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(def => (
      <Dropdown.Item
        key={`view-type--${def.type}`}
        testID={`view-type--${def.type}`}
        value={def.type}
        onClick={onUpdateType}
        selected={def.type === viewType}
      >
        <div className="view-type-dropdown--graphic">{def.graphic}</div>
        <div className="view-type-dropdown--name">{def.name}</div>
      </Dropdown.Item>
    ))

  return (
    <Dropdown
      style={{width: '215px'}}
      className="view-type-dropdown"
      testID="view-type--dropdown"
      button={(active, onClick) => (
        <Dropdown.Button
          active={active}
          onClick={onClick}
          status={
            viewType === 'check'
              ? ComponentStatus.Disabled
              : ComponentStatus.Valid
          }
        >
          <div className="view-type-dropdown--graphic">
            {TYPE_DEFINITIONS[viewType].graphic}
          </div>
          <div className="view-type-dropdown--name">
            {TYPE_DEFINITIONS[viewType].name}
          </div>
        </Dropdown.Button>
      )}
      menu={onCollapse => (
        <Dropdown.Menu onCollapse={onCollapse} theme={DropdownMenuTheme.Onyx}>
          {items}
        </Dropdown.Menu>
      )}
    />
  )
}

export default ViewTypeDropdown
