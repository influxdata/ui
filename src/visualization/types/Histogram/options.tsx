import React, {FC} from 'react'

import {
  Input,
  Grid,
  Columns,
  Form,
  SelectDropdown,
  Dropdown,
  InputType,
  AutoInput,
  AutoInputMode,
  ComponentStatus,
  MultiSelectDropdown,
} from '@influxdata/clockface'

import AutoDomainInput from 'src/shared/components/AutoDomainInput'
import {defaultXColumn} from 'src/shared/utils/vis'
import ColorSchemeDropdown from 'src/visualization/components/internal/ColorSchemeDropdown'
import LegendOrientation from 'src/visualization/components/internal/LegendOrientation'
import {HistogramViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

interface Props extends VisualizationOptionProps {
  properties: HistogramViewProperties
}

const HistogramOptions: FC<Props> = ({properties, results, update}) => {
  const availableGroupColumns = results.table.columnKeys.filter(
    name => !['_value', '_time', 'table'].includes(name)
  )

  const groupDropdownStatus = availableGroupColumns.length
    ? ComponentStatus.Default
    : ComponentStatus.Disabled

  const xColumn = defaultXColumn(results.table, properties.xColumn)

  const numericColumns = results.table.columnKeys.filter(key => {
    if (key === 'result' || key === 'table') {
      return false
    }

    const columnType = results.table.getColumnType(key)

    return columnType === 'time' || columnType === 'number'
  })

  const handleChangeMode = (mode: AutoInputMode): void => {
    if (mode === AutoInputMode.Auto) {
      update({binCount: null})
    } else {
      update({binCount: 30})
    }
  }

  const setDomain = (axis: string, domain: [number, number]): void => {
    let bounds: [string | null, string | null]

    if (domain) {
      const [min, max] = domain
      bounds = [
        min === null ? null : String(min),
        max === null ? null : String(max),
      ]
    } else {
      bounds = [null, null]
    }

    if (bounds[0] === null && bounds[1] === null) {
      bounds = null
    }

    update({[`${axis}Domain`]: bounds})
  }

  let fillColumns = results.fluxGroupKeyUnion

  if (
    properties.fillColumns &&
    properties.fillColumns.every(col => availableGroupColumns.includes(col))
  ) {
    fillColumns = properties.fillColumns
  }

  const onSelectFillColumns = (option: string) => {
    const columnExists = fillColumns.find(col => col === option)
    let updatedColumns = fillColumns

    if (columnExists) {
      updatedColumns = fillColumns.filter(fc => fc !== option)
    } else {
      updatedColumns = [...fillColumns, option]
    }

    update({fillColumns: updatedColumns})
  }

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Four}
        >
          <h5 className="view-options--header">Data</h5>
          <Form.Element label="X Column">
            <SelectDropdown
              options={numericColumns}
              selectedOption={xColumn || 'Build a query before selecting...'}
              onSelect={xColumn => {
                update({xColumn})
              }}
              testID="dropdown-x"
              buttonStatus={
                numericColumns.length == 0
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
            />
          </Form.Element>
          <Form.Element label="Group By">
            <MultiSelectDropdown
              options={availableGroupColumns}
              selectedOptions={fillColumns}
              onSelect={onSelectFillColumns}
              buttonStatus={groupDropdownStatus}
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Four}
        >
          <h5 className="view-options--header">Options</h5>
          <Form.Element label="Color Scheme">
            <ColorSchemeDropdown
              value={properties.colors}
              onChange={colors => {
                update({colors})
              }}
            />
          </Form.Element>
          <Form.Element label="Positioning">
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button active={active} onClick={onClick}>
                  {properties.position}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  <Dropdown.Item
                    id="overlaid"
                    value="overlaid"
                    onClick={position => {
                      update({position})
                    }}
                    selected={properties.position === 'overlaid'}
                  >
                    Overlaid
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="stacked"
                    value="stacked"
                    onClick={position => {
                      update({position})
                    }}
                    selected={properties.position === 'stacked'}
                  >
                    Stacked
                  </Dropdown.Item>
                </Dropdown.Menu>
              )}
            />
          </Form.Element>
          <Form.Element label="Bins">
            <AutoInput
              mode={
                typeof properties.binCount === 'number'
                  ? AutoInputMode.Custom
                  : AutoInputMode.Auto
              }
              onChangeMode={handleChangeMode}
              inputComponent={
                <Input
                  name="binCount"
                  value={properties.binCount}
                  placeholder="Enter a number"
                  type={InputType.Number}
                  min={0}
                  onChange={evt => {
                    update({binCount: convertUserInputToNumOrNaN(evt)})
                  }}
                />
              }
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Four}
        >
          <h5 className="view-options--header">X Axis</h5>
          <Form.Element label="X Axis Label">
            <Input
              value={properties.xAxisLabel}
              onChange={e => update({xAxisLabel: e.target.value})}
            />
          </Form.Element>
          <AutoDomainInput
            domain={properties.xDomain as [number, number]}
            onSetDomain={domain => {
              setDomain('x', domain)
            }}
            label="X Axis Domain"
          />
        </Grid.Column>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Four}
        >
          <h5 className="view-options--header">Legend</h5>
          <LegendOrientation
            properties={properties}
            results={results}
            update={update}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default HistogramOptions
