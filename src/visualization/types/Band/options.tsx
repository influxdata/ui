import React, {FC} from 'react'

import {
  Input,
  InputType,
  Grid,
  Columns,
  Form,
  SelectDropdown,
  SelectGroup,
  Dropdown,
  ComponentStatus,
  ButtonShape,
} from '@influxdata/clockface'

import AutoDomainInput from 'src/shared/components/AutoDomainInput'
import {AXES_SCALE_OPTIONS} from 'src/visualization/constants'
import {
  FORMAT_OPTIONS,
  resolveTimeFormat,
} from 'src/visualization/utils/timeFormat'
import {
  defaultXColumn,
  defaultYColumn,
  parseYBounds,
} from 'src/shared/utils/vis'
import ColorSchemeDropdown from 'src/visualization/components/internal/ColorSchemeDropdown'
import LegendOrientation from 'src/visualization/components/internal/LegendOrientation'
import StaticLegend from 'src/visualization/components/internal/StaticLegend'
import AxisTicksGenerator from 'src/visualization/components/internal/AxisTicksGenerator'

import {BandViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'

const {BASE_2, BASE_10} = AXES_SCALE_OPTIONS
const UPPER_COLUMN_PLACEHOLDER = `Please enter upper column's function name`
const MAIN_COLUMN_PLACEHOLDER = `Please enter main column's function name`
const LOWER_COLUMN_PLACEHOLDER = `Please enter lower column's function name`

interface Props extends VisualizationOptionProps {
  properties: BandViewProperties
}

const BandViewOptions: FC<Props> = ({properties, results, update}) => {
  const numericColumns = (results?.table?.columnKeys || []).filter(key => {
    if (key === 'result' || key === 'table') {
      return false
    }

    const columnType = results.table.getColumnType(key)

    return columnType === 'time' || columnType === 'number'
  })

  const xColumn = defaultXColumn(results?.table, properties.xColumn)
  const yColumn = defaultYColumn(results?.table, properties.yColumn)
  const getGeomLabel = (geom: string): string => {
    switch (geom) {
      case 'monotoneX':
        return 'Smooth'
      case 'step':
        return 'Step'
      default:
      case 'line':
        return 'Linear'
    }
  }

  const updateAxis = (axis: string, value: any): void => {
    update({
      axes: {
        ...properties.axes,
        [axis]: {
          ...properties.axes[axis],
          ...value,
        },
      },
    })
  }

  const handleSetYDomain = (yDomain: [number, number]): void => {
    let bounds: [string | null, string | null]

    if (yDomain) {
      const [min, max] = yDomain
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

    updateAxis('y', {bounds})
  }

  const updateUpperColumn = evt => {
    update({
      upperColumn: evt.target.value,
    })
  }

  const updateMainColumn = evt => {
    update({
      mainColumn: evt.target.value,
    })
  }

  const updateLowerColumn = evt => {
    update({
      lowerColumn: evt.target.value,
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
        </Grid.Column>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Four}
        >
          <h5 className="view-options--header">Aggregate Functions</h5>
          <Form.Element label="Upper Column Name">
            <Input
              onChange={updateUpperColumn}
              onFocus={updateUpperColumn}
              placeholder={UPPER_COLUMN_PLACEHOLDER}
              type={InputType.Text}
              value={properties.upperColumn}
            />
          </Form.Element>
          <Form.Element label="Main Column Name">
            <Input
              onChange={updateMainColumn}
              onFocus={updateMainColumn}
              placeholder={MAIN_COLUMN_PLACEHOLDER}
              status={
                properties.mainColumn.length
                  ? ComponentStatus.Default
                  : ComponentStatus.Error
              }
              type={InputType.Text}
              value={properties.mainColumn}
            />
          </Form.Element>
          <Form.Element label="Lower Column Name">
            <Input
              onChange={updateLowerColumn}
              onFocus={updateLowerColumn}
              placeholder={LOWER_COLUMN_PLACEHOLDER}
              type={InputType.Text}
              value={properties.lowerColumn}
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Four}
        >
          <h5 className="view-options--header">Options</h5>
          {properties.geom && (
            <Form.Element label="Interpolation">
              <Dropdown
                button={(active, onClick) => (
                  <Dropdown.Button active={active} onClick={onClick}>
                    {getGeomLabel(properties.geom)}
                  </Dropdown.Button>
                )}
                menu={onCollapse => (
                  <Dropdown.Menu onCollapse={onCollapse}>
                    <Dropdown.Item
                      value="line"
                      onClick={(geom: string) => {
                        update({geom})
                      }}
                      selected={properties.geom === 'line'}
                    >
                      Linear
                    </Dropdown.Item>
                    <Dropdown.Item
                      value="monotoneX"
                      onClick={(geom: string) => {
                        update({geom})
                      }}
                      selected={properties.geom === 'monotoneX'}
                    >
                      Smooth
                    </Dropdown.Item>
                    <Dropdown.Item
                      value="step"
                      onClick={(geom: string) => {
                        update({geom})
                      }}
                      selected={properties.geom === 'step'}
                    >
                      Step
                    </Dropdown.Item>
                  </Dropdown.Menu>
                )}
              />
            </Form.Element>
          )}
          <Form.Element label="Line Colors">
            <ColorSchemeDropdown
              value={properties.colors.filter(c => c.type === 'scale')}
              onChange={colors => {
                update({colors})
              }}
            />
          </Form.Element>

          <br />
          <Form.Element label="Hover Dimension">
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button active={active} onClick={onClick}>
                  {properties.hoverDimension}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  <Dropdown.Item
                    id="auto"
                    value="auto"
                    onClick={hoverDimension => {
                      update({hoverDimension})
                    }}
                    selected={properties.hoverDimension === 'auto'}
                  >
                    Auto
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="x"
                    value="x"
                    onClick={hoverDimension => {
                      update({hoverDimension})
                    }}
                    selected={properties.hoverDimension === 'x'}
                  >
                    X-Axis
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="y"
                    value="y"
                    onClick={hoverDimension => {
                      update({hoverDimension})
                    }}
                    selected={properties.hoverDimension === 'y'}
                  >
                    Y-Axis
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="xy"
                    value="xy"
                    onClick={hoverDimension => {
                      update({hoverDimension})
                    }}
                    selected={properties.hoverDimension === 'xy'}
                  >
                    X-Y Axis
                  </Dropdown.Item>
                </Dropdown.Menu>
              )}
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column>
          <h5 className="view-options--header">X-Axis</h5>
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve} widthLG={Columns.Four}>
          <AxisTicksGenerator
            axisName="x"
            columnType={xColumn}
            label="Generate X-Axis Tick Marks"
            properties={properties}
            results={results}
            update={update}
          />
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve} widthLG={Columns.Four}>
          <h5 className="view-options--header">Y-Axis</h5>
          <Form.Element label="Y Axis Label">
            <Input
              value={properties.axes.y.label}
              onChange={evt => {
                updateAxis('y', {label: evt.target.value})
              }}
            />
          </Form.Element>
          <Form.Element label="Y-Value Unit Prefix">
            <SelectGroup shape={ButtonShape.StretchToFit}>
              <SelectGroup.Option
                name="y-values-format"
                id="y-values-format-tab--raw"
                value=""
                active={properties.axes.y.base === ''}
                titleText="Do not format values using a unit prefix"
                onClick={base => {
                  updateAxis('y', {base})
                }}
              >
                None
              </SelectGroup.Option>
              <SelectGroup.Option
                name="y-values-format"
                id="y-values-format-tab--kmb"
                value={BASE_10}
                active={properties.axes.y.base === BASE_10}
                titleText="Format values using an International System of Units prefix"
                onClick={base => {
                  updateAxis('y', {base})
                }}
              >
                SI
              </SelectGroup.Option>
              <SelectGroup.Option
                name="y-values-format"
                id="y-values-format-tab--kmg"
                value={BASE_2}
                active={properties.axes.y.base === BASE_2}
                titleText="Format values using a binary unit prefix (for formatting bits or bytes)"
                onClick={base => {
                  updateAxis('y', {base})
                }}
              >
                Binary
              </SelectGroup.Option>
            </SelectGroup>
          </Form.Element>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Six}>
              <Form.Element label="Y Axis Prefix">
                <Input
                  value={properties.axes.y.prefix}
                  onChange={evt => {
                    updateAxis('y', {prefix: evt.target.value})
                  }}
                />
              </Form.Element>
            </Grid.Column>
            <Grid.Column widthXS={Columns.Six}>
              <Form.Element label="Y Axis Suffix">
                <Input
                  value={properties.axes.y.suffix}
                  onChange={evt => {
                    updateAxis('y', {suffix: evt.target.value})
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
            domain={parseYBounds(properties.axes.y.bounds)}
            onSetDomain={handleSetYDomain}
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
          <StaticLegend
            properties={properties}
            results={results}
            update={update}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default BandViewOptions
