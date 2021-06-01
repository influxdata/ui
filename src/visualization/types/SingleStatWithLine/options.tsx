import React, {FC, useCallback} from 'react'

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
  AutoInput,
  AutoInputMode,
} from '@influxdata/clockface'

import AutoDomainInput from 'src/shared/components/AutoDomainInput'
import {
  AXES_SCALE_OPTIONS,
  MIN_DECIMAL_PLACES,
  MAX_DECIMAL_PLACES,
} from 'src/visualization/constants'
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'
import {
  FORMAT_OPTIONS,
  resolveTimeFormat,
} from 'src/visualization/utils/timeFormat'
import {
  defaultXColumn,
  defaultYColumn,
  parseYBounds,
} from 'src/shared/utils/vis'
import {
  THRESHOLD_TYPE_TEXT,
  THRESHOLD_TYPE_BG,
} from 'src/shared/constants/thresholds'
import ColorSchemeDropdown from 'src/visualization/components/internal/ColorSchemeDropdown'
import AxisTicksGenerator from 'src/visualization/components/internal/AxisTicksGenerator'
import Checkbox from 'src/shared/components/Checkbox'
import ThresholdsSettings from 'src/visualization/components/internal/ThresholdsSettings'
import LegendOrientation from 'src/visualization/components/internal/LegendOrientation'
import StaticLegend from 'src/visualization/components/internal/StaticLegend'
import {LinePlusSingleStatProperties, Color} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'

const {BASE_2, BASE_10} = AXES_SCALE_OPTIONS

interface Props extends VisualizationOptionProps {
  properties: LinePlusSingleStatProperties
}

const SingleStatWithLineOptions: FC<Props> = ({
  properties,
  results,
  update,
}) => {
  const numericColumns = results.table.columnKeys.filter(key => {
    if (key === 'result' || key === 'table') {
      return false
    }

    const columnType = results.table.getColumnType(key)

    return columnType === 'time' || columnType === 'number'
  })

  const xColumn = defaultXColumn(results.table, properties.xColumn)
  const yColumn = defaultYColumn(results.table, properties.yColumn)

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

  const setDigits = (digits: number | null) => {
    update({
      decimalPlaces: {
        ...properties.decimalPlaces,
        digits,
      },
    })
  }
  const handleChangeMode = (mode: AutoInputMode): void => {
    if (mode === AutoInputMode.Auto) {
      setDigits(null)
    } else {
      setDigits(2)
    }
  }
  const setColors = (colors: Color[]): void => {
    if (colors[0]?.type === 'scale') {
      update({
        colors: [
          ...properties.colors.filter(c => c.type !== 'scale'),
          ...colors,
        ],
      })
    } else {
      update({
        colors: [
          ...properties.colors.filter(c => c.type === 'scale'),
          ...colors,
        ],
      })
    }
  }

  const updateThreshold = useCallback(
    (threshold: string) => {
      update({
        colors: properties.colors.map(color => {
          if (color.type !== 'scale') {
            return {
              ...color,
              type:
                threshold === THRESHOLD_TYPE_BG
                  ? THRESHOLD_TYPE_BG
                  : THRESHOLD_TYPE_TEXT,
            }
          }

          return color
        }),
      })
    },
    [update, properties.colors]
  )

  const activeSetting =
    properties.colors.filter(color => color.type !== 'scale')[0]?.type || 'text'

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
          <h5 className="view-options--header">Options</h5>
          <Form.Element label="Line Colors">
            <ColorSchemeDropdown
              value={properties.colors.filter(c => c.type === 'scale')}
              onChange={setColors}
            />
          </Form.Element>

          <Checkbox
            label="Shade Area Below Lines"
            checked={!!properties.shadeBelow}
            onSetChecked={shadeBelow => {
              update({shadeBelow})
            }}
          />
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
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve} widthMD={Columns.Six}>
          <Grid.Row>
            <Grid.Column widthSM={Columns.Six}>
              <Form.Element label="Prefix">
                <Input
                  value={properties.prefix}
                  placeholder="%, MPH, etc."
                  onChange={evt => {
                    update({prefix: evt.target.value})
                  }}
                />
              </Form.Element>
            </Grid.Column>
            <Grid.Column widthSM={Columns.Six}>
              <Form.Element label="Suffix">
                <Input
                  value={properties.suffix}
                  placeholder="%, MPH, etc."
                  onChange={evt => {
                    update({suffix: evt.target.value})
                  }}
                />
              </Form.Element>
            </Grid.Column>
          </Grid.Row>
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve} widthMD={Columns.Six}>
          <Form.Element label="Decimal Places">
            <AutoInput
              mode={
                typeof properties.decimalPlaces.digits === 'number'
                  ? AutoInputMode.Custom
                  : AutoInputMode.Auto
              }
              onChangeMode={handleChangeMode}
              inputComponent={
                <Input
                  name="decimal-places"
                  placeholder="Enter a number"
                  onChange={evt => {
                    setDigits(convertUserInputToNumOrNaN(evt))
                  }}
                  value={properties.decimalPlaces.digits}
                  min={MIN_DECIMAL_PLACES}
                  max={MAX_DECIMAL_PLACES}
                  type={InputType.Number}
                />
              }
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve} widthMD={Columns.Six}>
          <Form.Element label="Colorized Thresholds">
            <ThresholdsSettings
              thresholds={properties.colors.filter(c => c.type !== 'scale')}
              onSetThresholds={setColors}
            />
          </Form.Element>
          <Form.Element label="Colorization" style={{marginTop: '16px'}}>
            <SelectGroup shape={ButtonShape.StretchToFit}>
              <SelectGroup.Option
                name="threshold-coloring"
                titleText="background"
                id="background"
                active={activeSetting === THRESHOLD_TYPE_BG}
                onClick={updateThreshold}
                value={THRESHOLD_TYPE_BG}
              >
                Background
              </SelectGroup.Option>
              <SelectGroup.Option
                name="threshold-coloring"
                titleText="text"
                id="text"
                active={activeSetting === THRESHOLD_TYPE_TEXT}
                onClick={updateThreshold}
                value={THRESHOLD_TYPE_TEXT}
              >
                Text
              </SelectGroup.Option>
            </SelectGroup>
          </Form.Element>
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

export default SingleStatWithLineOptions
