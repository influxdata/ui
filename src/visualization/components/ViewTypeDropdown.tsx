import React, {FC} from 'react'
import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'

// Components
import {Dropdown, DropdownMenuTheme} from '@influxdata/clockface'
import {ComponentStatus} from '@influxdata/clockface'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export interface Props {
  viewType: string
  onUpdateType: (type: string) => void
  filter?: string[]
}

const ViewTypeDropdown: FC<Props> = ({viewType, onUpdateType, filter = []}) => {
  const items = Object.values(SUPPORTED_VISUALIZATIONS)
    .filter(def => !filter.includes(def.type))
    .filter(def => !def.disabled)
    .filter(def => !def.featureFlag || isFlagEnabled(def.featureFlag))
    .filter(def => def.options)
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
            {SUPPORTED_VISUALIZATIONS[viewType]?.graphic}
          </div>
          <div className="view-type-dropdown--name">
            {SUPPORTED_VISUALIZATIONS[viewType]?.name}
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
