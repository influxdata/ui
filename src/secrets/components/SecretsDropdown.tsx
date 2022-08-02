import React, {FC} from 'react'
import {Dropdown, Icon, IconFont, ComponentColor} from '@influxdata/clockface'
import {Secret} from 'src/types'

type OwnProps = {
  selected?: string
  secrets: Secret[]
  onSelect: (v: any) => void
  onCreate: (f: Function) => void
  testID?: string
}
const SecretsDropdown: FC<OwnProps> = ({
  selected,
  secrets,
  onSelect,
  onCreate,
  testID = 'secrets',
}) => {
  return (
    <Dropdown
      testID={`dropdown--${testID}`}
      style={{width: '180px'}}
      button={(active, onClick) => (
        <Dropdown.Button
          active={active}
          onClick={onClick}
          icon={IconFont.Lock}
          color={ComponentColor.Default}
          testID={`dropdown-button--${testID}`}
        >
          {selected !== '' ? selected : 'Choose Secret'}
        </Dropdown.Button>
      )}
      menu={onCollapse => (
        <Dropdown.Menu onCollapse={onCollapse}>
          <Dropdown.Item
            testID="dropdown-item--create-secret"
            id="create"
            key="create"
            value="create"
            className="secrets-dropdown-header"
            onClick={() => onCreate(onSelect)}
          >
            <Icon style={{marginRight: '4px'}} glyph={IconFont.Plus_New} />
            Create Secret
          </Dropdown.Item>
          {secrets.map(s => (
            <Dropdown.Item
              testID={`dropdown-item--${s.id}`}
              id={s.id}
              key={s.id}
              value={s.id}
              onClick={onSelect}
            >
              {s.id}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    />
  )
}

export default SecretsDropdown
