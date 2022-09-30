// Libraries
import React, {FC} from 'react'

// Components
import {
  Form,
  Grid,
  Input,
  SelectDropdown,
  ComponentStatus,
  Columns,
  MultiSelectDropdown,
} from '@influxdata/clockface'
import ColorSchemeDropdown from 'src/visualization/components/internal/ColorSchemeDropdown'
import HoverLegend from 'src/visualization/components/internal/HoverLegend'
import AxisTicksGenerator from 'src/visualization/components/internal/AxisTicksGenerator'
import {
  FORMAT_OPTIONS,
  resolveTimeFormat,
} from 'src/visualization/utils/timeFormat'
import {
  defaultXColumn,
  defaultYLabelColumns,
  defaultYSeriesColumns,
} from 'src/shared/utils/vis'

// Types
import {MosaicViewProperties, Color} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'

interface Props extends VisualizationOptionProps {
  properties: MosaicViewProperties
}

const MosaicOptions: FC<Props> = props => {
  const {properties, results, update} = props
  let fillColumns = []
  const stringColumns = results.table.columnKeys.filter(k => {
    if (k === 'result' || k === 'table') {
      return false
    }

    return results.table.getColumnType(k) === 'string'
  })

  // Mosaic graphs are currently limited to always using _time on the x-axis
  //   future enhancements will depend on the visualization library
  const xDataColumn = (results?.table?.columnKeys || []).filter(
    key => key === '_time'
  )

  if (
    Array.isArray(properties.fillColumns) &&
    properties.fillColumns.every(col => stringColumns.includes(col))
  ) {
    fillColumns = properties.fillColumns
  } else {
    for (const key of stringColumns) {
      if (key.startsWith('_value')) {
        fillColumns = [key]
        break
      }
    }
  }

  const xColumn = defaultXColumn(results.table, properties.xColumn)
  const ySeriesColumns = defaultYSeriesColumns(
    results.table,
    properties.ySeriesColumns
  )

  const yLabelColumns = defaultYLabelColumns(
    properties.yLabelColumns,
    ySeriesColumns
  )

  // TODO: make this normal DashboardColor[] and not string[]
  const colors = properties.colors.map(color => {
    return {hex: color} as Color
  })

  const updateYLabelColumns = (
    validYSeriesColumns: Array<string>,
    currentYLabelColumns: Array<string>,
    option: string
  ): Array<string> => {
    const columnExists = Array.isArray(currentYLabelColumns)
      ? currentYLabelColumns.find(col => col === option)
      : false
    let updatedYLabelColumns = currentYLabelColumns || []

    if (columnExists) {
      updatedYLabelColumns = currentYLabelColumns.filter(
        currentYLabelColumn => currentYLabelColumn !== option
      )
    } else {
      updatedYLabelColumns = validYSeriesColumns.includes(option)
        ? [...updatedYLabelColumns, option]
        : updatedYLabelColumns
    }
    return updatedYLabelColumns
  }

  const onSelectYSeriesColumns = (option: string) => {
    const columnExists = Array.isArray(ySeriesColumns)
      ? ySeriesColumns.find(col => col === option)
      : false
    let updatedYSeriesColumns = ySeriesColumns || []

    if (columnExists) {
      updatedYSeriesColumns = ySeriesColumns.filter(
        ySeriesColumn => ySeriesColumn !== option
      )
    } else {
      updatedYSeriesColumns = [...updatedYSeriesColumns, option]
    }

    const updatedYLabelColumns = updateYLabelColumns(
      updatedYSeriesColumns,
      yLabelColumns,
      option
    )
    update({
      yLabelColumns: updatedYLabelColumns,
      ySeriesColumns: updatedYSeriesColumns,
    })
  }

  const onSelectYLabelColumns = (option: string) => {
    update({
      yLabelColumns: updateYLabelColumns(ySeriesColumns, yLabelColumns, option),
    })
  }

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Four}
        >
          <h5 className="view-options--header" style={{marginTop: 0}}>Data</h5>
          <Form.Element label="Fill Column">
            <SelectDropdown
              options={stringColumns}
              selectedOption={
                fillColumns?.[0] || 'Build a query before selecting...'
              }
              onSelect={fillColumn => {
                update({fillColumns: [fillColumn]})
              }}
              testID="dropdown-fill"
              buttonStatus={
                stringColumns.length == 0
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
            />
          </Form.Element>
          <Form.Element label="X Column">
            <SelectDropdown
              options={xDataColumn}
              selectedOption={xColumn || 'Build a query before selecting...'}
              onSelect={xColumn => {
                update({xColumn})
              }}
              testID="dropdown-x"
              buttonStatus={
                xDataColumn.length === 0
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
            />
          </Form.Element>
          <Form.Element label="Y Columns">
            <MultiSelectDropdown
              options={stringColumns}
              selectedOptions={ySeriesColumns}
              onSelect={onSelectYSeriesColumns}
              buttonStatus={ComponentStatus.Default}
            />
          </Form.Element>
          <Form.Element label="Time Format">
            <SelectDropdown
              options={FORMAT_OPTIONS.map(option => option.text)}
              selectedOption={resolveTimeFormat(properties.timeFormat)}
              onSelect={(format: string) => {
                update({timeFormat: format})
              }}
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
              value={colors}
              onChange={colors => {
                update({colors: colors.map(c => c.hex)})
              }}
            />
          </Form.Element>
          <h5 className="view-options--header">X-Axis</h5>
          <Form.Element label="X Axis Label">
            <Input
              value={properties.xAxisLabel}
              onChange={e => update({xAxisLabel: e.target.value})}
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
          <h5 className="view-options--header">Y-Axis</h5>
          <Form.Element label="Y Axis Label">
            <Input
              value={properties.yAxisLabel}
              onChange={e => update({yAxisLabel: e.target.value})}
            />
          </Form.Element>
          <Form.Element label="Y Label Separator">
            <Input
              value={properties.yLabelColumnSeparator}
              onChange={e => update({yLabelColumnSeparator: e.target.value})}
            />
          </Form.Element>
          <Form.Element label="Y Labels">
            <MultiSelectDropdown
              options={ySeriesColumns}
              selectedOptions={yLabelColumns}
              onSelect={onSelectYLabelColumns}
              buttonStatus={ComponentStatus.Default}
            />
          </Form.Element>
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

export default MosaicOptions
