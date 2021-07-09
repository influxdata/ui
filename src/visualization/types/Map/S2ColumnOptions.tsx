import React, {FC} from 'react'
import {
  Dropdown,
  ComponentStatus,
  DropdownMenuTheme,
} from '@influxdata/clockface'
import {GeoViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'
import {findTags} from './utils'
import './GeoOptions.scss'

interface Props extends VisualizationOptionProps {
  properties: GeoViewProperties
}

export const S2ColumnOptions: FC<Props> = ({properties, update, results}) => {
  const {s2Column} = properties

  const tags = findTags(results.table)

  const handleS2Select = (selection: string): void => {
    update({
      s2Column: selection,
    })
  }

  return (
    <>
      <Dropdown
        className="geo-dropdowns"
        button={(active, onClick) => (
          <Dropdown.Button
            active={active}
            onClick={onClick}
            status={ComponentStatus.Default}
          >
            {s2Column ? s2Column : 'Select S2 Column'}
          </Dropdown.Button>
        )}
        menu={onCollapse => (
          <Dropdown.Menu onCollapse={onCollapse} theme={DropdownMenuTheme.Onyx}>
            {Object.keys(tags).map(tag => {
              const tagValue = tags[tag]
              return (
                <Dropdown.Item
                  id={tagValue.column}
                  key={tagValue.column}
                  value={tagValue.column}
                  selected={tagValue.column === s2Column}
                  onClick={handleS2Select}
                >
                  {tagValue.column}
                </Dropdown.Item>
              )
            })}
          </Dropdown.Menu>
        )}
      />
    </>
  )
}
