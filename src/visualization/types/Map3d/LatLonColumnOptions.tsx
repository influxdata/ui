import React, {FC} from 'react'
import {
  Dropdown,
  ComponentStatus,
  DropdownMenuTheme,
} from '@influxdata/clockface'
import {GeoViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'
import {findFields, findTags} from './utils'
import './GeoOptions.scss'

interface Props extends VisualizationOptionProps {
  properties: GeoViewProperties
}

export const LatLonColumnOptions: FC<Props> = ({
  properties,
  update,
  results,
}) => {
  const {latLonColumns} = properties

  const tagsAndFields = {
    ...findFields(results.table),
    ...findTags(results.table, true),
  }

  const handleLatSelect = (selection: string): void => {
    const latLonColumnOptions = {
      lat: selection,
      lon: latLonColumns.lon,
    }
    update({
      latLonColumns: latLonColumnOptions,
    })
  }

  const handleLonSelect = (selection: string): void => {
    const latLonColumnOptions = {
      lat: latLonColumns.lat,
      lon: selection,
    }
    update({
      latLonColumns: latLonColumnOptions,
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
            {latLonColumns?.lat?.column !== ''
              ? latLonColumns.lat.column
              : 'Select Lat Column'}
          </Dropdown.Button>
        )}
        menu={onCollapse => (
          <Dropdown.Menu onCollapse={onCollapse} theme={DropdownMenuTheme.Onyx}>
            {Object.keys(tagsAndFields).map(tagAndField => {
              const value = tagsAndFields[tagAndField]
              return (
                <Dropdown.Item
                  id={value.key}
                  key={value.column}
                  value={value}
                  selected={value.column === latLonColumns?.lat?.column}
                  onClick={handleLatSelect}
                >
                  {value.column}
                </Dropdown.Item>
              )
            })}
          </Dropdown.Menu>
        )}
      />
      <Dropdown
        className="geo-dropdowns"
        button={(active, onClick) => (
          <Dropdown.Button
            active={active}
            onClick={onClick}
            status={ComponentStatus.Default}
          >
            {latLonColumns?.lon?.column !== ''
              ? latLonColumns.lon.column
              : 'Select Lon Column'}
          </Dropdown.Button>
        )}
        menu={onCollapse => (
          <Dropdown.Menu onCollapse={onCollapse} theme={DropdownMenuTheme.Onyx}>
            {Object.keys(tagsAndFields).map(tagAndField => {
              const value = tagsAndFields[tagAndField]
              return (
                <Dropdown.Item
                  id={value.key}
                  key={value.column}
                  value={value}
                  selected={value.column === latLonColumns?.lon?.column}
                  onClick={handleLonSelect}
                >
                  {value.column}
                </Dropdown.Item>
              )
            })}
          </Dropdown.Menu>
        )}
      />
    </>
  )
}
