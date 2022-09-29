// Libraries
import React, {FC} from 'react'
import {
  Input,
  Grid,
  Columns,
  Form,
  SelectDropdown,
  ComponentStatus,
  MultiSelectDropdown,
} from '@influxdata/clockface'

// Components
import {AdaptiveZoomToggle} from 'src/visualization/components/internal/AdaptiveZoomOption'
import AutoDomainInput from 'src/shared/components/AutoDomainInput'
import HexColorSchemeDropdown from 'src/visualization/components/internal/HexColorSchemeDropdown'
import HoverLegend from 'src/visualization/components/internal/HoverLegend'
import AxisTicksGenerator from 'src/visualization/components/internal/AxisTicksGenerator'

// Utils
import {
  FORMAT_OPTIONS,
  resolveTimeFormat,
} from 'src/visualization/utils/timeFormat'
import {defaultXColumn, defaultYColumn} from 'src/shared/utils/vis'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {ScatterViewProperties} from 'src/types'
import {TimeDomainAutoToggle} from 'src/visualization/types/Scatter/TimeAutoToggle'
import {VisualizationOptionProps} from 'src/visualization'

// Constants
import {GIRAFFE_COLOR_SCHEMES} from 'src/shared/constants'
interface Props extends VisualizationOptionProps {
  properties: ScatterViewProperties
}

const ScatterOptions: FC<Props> = ({properties, results, update}) => {
  const availableGroupColumns = results.table.columnKeys.filter(
    name => !['_value', '_time', 'table'].includes(name)
  )

  const groupDropdownStatus = availableGroupColumns.length
    ? ComponentStatus.Default
    : ComponentStatus.Disabled

  const xColumn = defaultXColumn(results.table, properties.xColumn)
  const yColumn = defaultYColumn(results.table, properties.yColumn)

  let fillColumns = availableGroupColumns
  let symbolColumns = availableGroupColumns

  if (
    properties.fillColumns &&
    properties.fillColumns.every(col => availableGroupColumns.includes(col))
  ) {
    fillColumns = properties.fillColumns
  }

  if (
    properties.symbolColumns &&
    properties.symbolColumns.every(col => availableGroupColumns.includes(col))
  ) {
    symbolColumns = properties.symbolColumns
  }

  const numericColumns = results.table.columnKeys.filter(key => {
    if (key === 'result' || key === 'table') {
      return false
    }

    const columnType = results.table.getColumnType(key)

    return columnType === 'time' || columnType === 'number'
  })

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

  const onSelectSymbolColumns = (option: string) => {
    const columnExists = symbolColumns.find(col => col === option)
    let updatedColumns = symbolColumns

    if (columnExists) {
      updatedColumns = symbolColumns.filter(fc => fc !== option)
    } else {
      updatedColumns = [...symbolColumns, option]
    }

    update({symbolColumns: updatedColumns})
  }

  const setDomain = (axis: string, domain: [number, number]): void => {
    let bounds: [number | null, number | null]

    if (domain) {
      const [min, max] = domain
      bounds = [min, max]
    } else {
      bounds = [null, null]
    }

    if (bounds[0] === null && bounds[1] === null) {
      bounds = null
    }

    update({[`${axis}Domain`]: bounds})
  }

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Four}
          className="view-options-container"
        >
          <h5 className="view-options--header">Data</h5>
          <Form.Element label="Symbol Column">
            <MultiSelectDropdown
              options={availableGroupColumns}
              selectedOptions={symbolColumns}
              onSelect={onSelectSymbolColumns}
              buttonStatus={groupDropdownStatus}
            />
          </Form.Element>
          <Form.Element label="Fill Column">
            <MultiSelectDropdown
              options={availableGroupColumns}
              selectedOptions={fillColumns}
              onSelect={onSelectFillColumns}
              buttonStatus={groupDropdownStatus}
            />
          </Form.Element>
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
          <Form.Element label="Y Column">
            <SelectDropdown
              options={numericColumns}
              selectedOption={yColumn || 'Build a query before selecting...'}
              onSelect={yColumn => {
                update({yColumn})
              }}
              testID="dropdown-y"
              buttonStatus={
                numericColumns.length == 0
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
            />
          </Form.Element>
          {isFlagEnabled('zoomRequery') && (
            <AdaptiveZoomToggle
              adaptiveZoomHide={properties.adaptiveZoomHide}
              type={properties.type}
              update={update}
            />
          )}
          <h5 className="view-options--header">Options</h5>
          <Form.Element label="Time Format">
            <SelectDropdown
              options={FORMAT_OPTIONS.map(option => option.text)}
              selectedOption={resolveTimeFormat(properties.timeFormat)}
              onSelect={(format: string) => {
                update({timeFormat: format})
              }}
            />
          </Form.Element>
          {xColumn === '_time' && (
            <Form.Element label="Auto Scale Domain">
              <TimeDomainAutoToggle
                xDomain={properties.xDomain}
                setDomain={setDomain}
                table={results.table}
              />
            </Form.Element>
          )}
          <Form.Element label="Color Scheme">
            <HexColorSchemeDropdown
              colorSchemes={GIRAFFE_COLOR_SCHEMES}
              selectedColorScheme={properties.colors}
              onSelectColorScheme={colors => {
                update({colors})
              }}
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Four}
        >
          <h5 className="view-options--header">X-Axis</h5>
          <Form.Element label="X Axis Label">
            <Input
              value={properties.xAxisLabel}
              onChange={e => {
                update({xAxisLabel: e.target.value})
              }}
            />
          </Form.Element>
          <AxisTicksGenerator
            axisName="x"
            columnType={xColumn}
            label="Generate X-Axis Tick Marks"
            properties={properties}
            results={results}
            update={update}
          />
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
          <h5 className="view-options--header">Y-Axis</h5>
          <Form.Element label="Y Axis Label">
            <Input
              value={properties.yAxisLabel}
              onChange={e => {
                update({yAxisLabel: e.target.value})
              }}
            />
          </Form.Element>
          <Grid.Row>
            <Grid.Column widthSM={Columns.Six}>
              <Form.Element label="Y Tick Prefix">
                <Input
                  value={properties.yPrefix}
                  onChange={evt => {
                    update({yPrefix: evt.target.value})
                  }}
                />
              </Form.Element>
            </Grid.Column>
            <Grid.Column widthSM={Columns.Six}>
              <Form.Element label="Y Tick Suffix">
                <Input
                  value={properties.ySuffix}
                  onChange={evt => {
                    update({ySuffix: evt.target.value})
                  }}
                />
              </Form.Element>
            </Grid.Column>
          </Grid.Row>
          <AxisTicksGenerator
            axisName="y"
            columnType={yColumn}
            label="Generate Y-Axis Tick Marks"
            properties={properties}
            results={results}
            update={update}
          />
          <AutoDomainInput
            domain={properties.yDomain as [number, number]}
            onSetDomain={domain => {
              setDomain('y', domain)
            }}
            label="Y Axis Domain"
          />
        </Grid.Column>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Four}
        >
          <h5 className="view-options--header">Hover Legend</h5>
          <HoverLegend
            properties={properties}
            results={results}
            update={update}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default ScatterOptions
