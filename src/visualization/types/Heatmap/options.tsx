// Libraries
import React, {FC, ChangeEvent, useState} from 'react'
import {VIRIDIS, MAGMA, INFERNO, PLASMA} from '@influxdata/giraffe'
import {
  Form,
  Grid,
  Input,
  Columns,
  SelectDropdown,
  InputType,
  ComponentStatus,
} from '@influxdata/clockface'

// Utils
import {
  FORMAT_OPTIONS,
  resolveTimeFormat,
} from 'src/visualization/utils/timeFormat'
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'
import {defaultXColumn, defaultYColumn} from 'src/shared/utils/vis'

// Components
import AutoDomainInput from 'src/shared/components/AutoDomainInput'
import HexColorSchemeDropdown from 'src/visualization/components/internal/HexColorSchemeDropdown'
import LegendOrientation from 'src/visualization/components/internal/LegendOrientation'
import AxisTicksGenerator from 'src/visualization/components/internal/AxisTicksGenerator'

import {HeatmapViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'

const HEATMAP_COLOR_SCHEMES = [
  {name: 'Magma', colors: MAGMA},
  {name: 'Inferno', colors: INFERNO},
  {name: 'Viridis', colors: VIRIDIS},
  {name: 'Plasma', colors: PLASMA},
]

interface Props extends VisualizationOptionProps {
  properties: HeatmapViewProperties
}

const HeatmapOptions: FC<Props> = ({properties, results, update}) => {
  const [binInputStatus, setBinInputStatus] = useState(ComponentStatus.Default)
  const [binInput, setBinInput] = useState(properties.binSize)

  const xColumn = defaultXColumn(results.table, properties.xColumn)
  const yColumn = defaultYColumn(results.table, properties.yColumn)

  const onSetBinSize = (e: ChangeEvent<HTMLInputElement>) => {
    const val = convertUserInputToNumOrNaN(e)
    setBinInput(val)

    if (isNaN(val) || val < 5) {
      setBinInputStatus(ComponentStatus.Error)
      return
    }

    setBinInputStatus(ComponentStatus.Default)
    update({binSize: val})
  }

  const numericColumns = results.table.columnKeys.filter(key => {
    if (key === 'result' || key === 'table') {
      return false
    }

    const columnType = results.table.getColumnType(key)

    return columnType === 'time' || columnType === 'number'
  })

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
          <Form.Element label="Time Format">
            <SelectDropdown
              options={FORMAT_OPTIONS.map(option => option.text)}
              selectedOption={resolveTimeFormat(properties.timeFormat)}
              onSelect={(format: string) => {
                update({timeFormat: format})
              }}
            />
          </Form.Element>
          <h5 className="view-options--header">Options</h5>
          <Form.Element label="Color Scheme">
            <HexColorSchemeDropdown
              colorSchemes={HEATMAP_COLOR_SCHEMES}
              selectedColorScheme={properties.colors}
              onSelectColorScheme={colors => {
                update({colors})
              }}
            />
          </Form.Element>
          <Form.Element label="Bin Size">
            <Input
              status={binInputStatus}
              value={binInput}
              type={InputType.Number}
              onChange={onSetBinSize}
              testID="bin-size-input"
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
              onChange={e => {
                update({xAxisLabel: e.target.value})
              }}
            />
          </Form.Element>
          <Grid.Row>
            <Grid.Column widthSM={Columns.Six}>
              <Form.Element label="X Tick Prefix">
                <Input
                  value={properties.xPrefix}
                  onChange={evt => {
                    update({xPrefix: evt.target.value})
                  }}
                />
              </Form.Element>
            </Grid.Column>
            <Grid.Column widthSM={Columns.Six}>
              <Form.Element label="X Tick Suffix">
                <Input
                  value={properties.xSuffix}
                  onChange={evt => {
                    update({xSuffix: evt.target.value})
                  }}
                />
              </Form.Element>
            </Grid.Column>
          </Grid.Row>
          <AxisTicksGenerator
            axisName="x"
            columnType={xColumn}
            label="Generate X Axis tick marks"
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
          <h5 className="view-options--header">Y Axis</h5>
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
                  placeholder="%, MPH, etc."
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
                  placeholder="%, MPH, etc."
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
            label="Generate Y Axis tick marks"
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

export default HeatmapOptions
