// Libraries
import React, {FC, useCallback, useMemo, useState} from 'react'
import {debounce} from 'lodash'
import {
  ButtonShape,
  Columns,
  ComponentSize,
  ComponentStatus,
  Dropdown,
  FlexBox,
  Form,
  Grid,
  Input,
  InputLabel,
  SelectDropdown,
  SelectGroup,
  SlideToggle,
} from '@influxdata/clockface'
import {createGroupIDColumn} from '@influxdata/giraffe'

import {AXES_SCALE_OPTIONS} from 'src/visualization/constants'

// Utils
import {
  FORMAT_OPTIONS,
  resolveTimeFormat,
} from 'src/visualization/utils/timeFormat'
import {
  defaultXColumn,
  defaultYColumn,
  parseYBounds,
} from 'src/shared/utils/vis'
import {generateSeriesToColorHex} from 'src/visualization/utils/colorMappingUtils'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Components
import {AdaptiveZoomToggle} from 'src/visualization/components/internal/AdaptiveZoomOption'
import AutoDomainInput from 'src/shared/components/AutoDomainInput'
import ColorSchemeDropdown from 'src/visualization/components/internal/ColorSchemeDropdown'
import HoverLegend from 'src/visualization/components/internal/HoverLegend'
import StaticLegend from 'src/visualization/components/internal/StaticLegend'
import AxisTicksGenerator from 'src/visualization/components/internal/AxisTicksGenerator'
import {XYViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'

const {BASE_2, BASE_10} = AXES_SCALE_OPTIONS

interface Props extends VisualizationOptionProps {
  properties: XYViewProperties
}

export const GraphOptions: FC<Props> = ({properties, results, update}) => {
  const [yAxisLabel, setYAxisLabel] = useState(properties.axes.y.label)
  const [yAxisPrefix, setYAxisPrefix] = useState(properties.axes.y.prefix)
  const [yAxisSuffix, setYAxisSuffix] = useState(properties.axes.y.suffix)

  const groupKey = useMemo(
    () => [...results.fluxGroupKeyUnion, 'result'],
    [results]
  )

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
      case 'stepBefore':
        return 'StepBefore'
      case 'stepAfter':
        return 'StepAfter'
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

  const updateAxisDebounced = useCallback(debounce(updateAxis, 200), [properties])

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
        </Grid.Column>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Four}
        >
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
                    <Dropdown.Item
                      value="stepBefore"
                      onClick={(geom: string) => {
                        update({geom})
                      }}
                      selected={properties.geom === 'stepBefore'}
                    >
                      StepBefore
                    </Dropdown.Item>
                    <Dropdown.Item
                      value="stepAfter"
                      onClick={(geom: string) => {
                        update({geom})
                      }}
                      selected={properties.geom === 'stepAfter'}
                    >
                      StepAfter
                    </Dropdown.Item>
                  </Dropdown.Menu>
                )}
              />
            </Form.Element>
          )}
          <Form.Element label="Line Colors">
            <ColorSchemeDropdown
              value={properties.colors?.filter(c => c.type === 'scale') ?? []}
              onChange={colors => {
                const [, fillColumnMap] = createGroupIDColumn(
                  results.table,
                  groupKey
                )
                // the properties that we use to calculate the colors are updated in the next render cycle so we need
                // to make a new object and override the colors
                const newProperties = {...properties, colors}
                const colorMapping = generateSeriesToColorHex(
                  fillColumnMap,
                  newProperties
                )

                update({colors, colorMapping})
              }}
            />
          </Form.Element>
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
          <Form.Element label="">
            <FlexBox margin={ComponentSize.Medium}>
              <SlideToggle
                active={!!properties.shadeBelow}
                onChange={() => {
                  update({shadeBelow: !properties.shadeBelow})
                }}
              />
              <InputLabel>Shade area below graph</InputLabel>
            </FlexBox>
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
              value={yAxisLabel}
              onKeyPress={event => {
                if (event.code === 'Enter') {
                  updateAxis('y', {label: yAxisLabel})
                }
              }}
              onChange={event => {
                setYAxisLabel(event.target.value)
                updateAxisDebounced('y', {label: event.target.value})
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
                  value={yAxisPrefix}
                  onKeyPress={event => {
                    if (event.code === 'Enter') {
                      updateAxis('y', {prefix: yAxisPrefix})
                    }
                  }}
                  onChange={event => {
                    setYAxisPrefix(event.target.value)
                    updateAxisDebounced('y', {prefix: event.target.value})
                  }}
                />
              </Form.Element>
            </Grid.Column>
            <Grid.Column widthXS={Columns.Six}>
              <Form.Element label="Y Axis Suffix">
                <Input
                  value={yAxisSuffix}
                  onKeyPress={event => {
                    if (event.code === 'Enter') {
                      updateAxis('y', {suffix: yAxisSuffix})
                    }
                  }}
                  onChange={event => {
                    setYAxisSuffix(event.target.value)
                    updateAxisDebounced('y', {suffix: event.target.value})
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
          <h5 className="view-options--header">Static Legend</h5>
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
