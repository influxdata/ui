// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {capitalize} from 'lodash'

// Components
import {Grid, Form, Dropdown} from '@influxdata/clockface'
import Geom from 'src/timeMachine/components/view_options/Geom'
import YAxisTitle from 'src/timeMachine/components/view_options/YAxisTitle'
import AxisAffixes from 'src/timeMachine/components/view_options/AxisAffixes'
import ColorSelector from 'src/timeMachine/components/view_options/ColorSelector'
import AutoDomainInput from 'src/shared/components/AutoDomainInput'
import YAxisBase from 'src/timeMachine/components/view_options/YAxisBase'
import ColumnSelector from 'src/shared/components/ColumnSelector'
import Checkbox from 'src/shared/components/Checkbox'
import TimeFormat from 'src/timeMachine/components/view_options/TimeFormat'
import LegendOrientation from 'src/timeMachine/components/view_options/LegendOrientation'
import AxisTicksGenerator from 'src/shared/components/axisTicks/AxisTicksGenerator'

// Actions
import {
  setColors,
  setYAxisLabel,
  setAxisPrefix,
  setAxisSuffix,
  setYAxisBounds,
  setYAxisBase,
  setGeom,
  setXColumn,
  setYColumn,
  setShadeBelow,
  setLinePosition,
  setTimeFormat,
  setHoverDimension,
  setLegendOpacity,
  setLegendOrientationThreshold,
  setGenerateXAxisTicks,
  setXTotalTicks,
  setXTickStart,
  setXTickStep,
  setGenerateYAxisTicks,
  setYTotalTicks,
  setYTickStart,
  setYTickStep,
} from 'src/timeMachine/actions'

// Utils
import {parseYBounds} from 'src/shared/utils/vis'
import {
  getXColumnSelection,
  getYColumnSelection,
  getNumericColumns,
  getActiveTimeMachine,
} from 'src/timeMachine/selectors'

// Types
import {
  AppState,
  XYGeom,
  Axes,
  Color,
  NewView,
  XYViewProperties,
  ViewType,
} from 'src/types'
import {LinePosition} from '@influxdata/giraffe'

interface OwnProps {
  type: ViewType
  axes: Axes
  geom?: XYGeom
  colors: Color[]
  shadeBelow?: boolean
  hoverDimension?: 'auto' | 'x' | 'y' | 'xy'
  position: LinePosition
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

class LineOptions extends PureComponent<Props> {
  public render() {
    const {
      axes: {
        y: {label, prefix, suffix, base},
      },
      colors,
      geom,
      shadeBelow,
      position,
      onSetPosition,
      onUpdateColors,
      onUpdateYAxisLabel,
      onUpdateAxisPrefix,
      onUpdateAxisSuffix,
      onUpdateYAxisBase,
      onSetShadeBelow,
      onSetGeom,
      onSetYColumn,
      yColumn,
      onSetXColumn,
      xColumn,
      numericColumns,
      onSetTimeFormat,
      timeFormat,
      hoverDimension,
      onSetHoverDimension,
      onSetLegendOpacity,
      onSetLegendOrientationThreshold,
      onSetGenerateXAxisTicks,
      onSetXTotalTicks,
      onSetXTickStart,
      onSetXTickStep,
      onSetGenerateYAxisTicks,
      onSetYTotalTicks,
      onSetYTickStart,
      onSetYTickStep,
    } = this.props

    return (
      <>
        <Grid.Column>
          <h4 className="view-options--header">Customize Line Graph</h4>
          <h5 className="view-options--header">Data</h5>
          <ColumnSelector
            selectedColumn={xColumn}
            onSelectColumn={onSetXColumn}
            availableColumns={numericColumns}
            axisName="x"
          />
          <ColumnSelector
            selectedColumn={yColumn}
            onSelectColumn={onSetYColumn}
            availableColumns={numericColumns}
            axisName="y"
          />
          <Form.Element label="Time Format">
            <TimeFormat
              timeFormat={timeFormat}
              onTimeFormatChange={onSetTimeFormat}
            />
          </Form.Element>
          <h5 className="view-options--header">Options</h5>
        </Grid.Column>
        {geom && <Geom geom={geom} onSetGeom={onSetGeom} />}
        <ColorSelector
          colors={colors.filter(c => c.type === 'scale')}
          onUpdateColors={onUpdateColors}
        />
        <Grid.Column>
          <Checkbox
            label="Shade Area Below Lines"
            checked={!!shadeBelow}
            onSetChecked={onSetShadeBelow}
          />
        </Grid.Column>
        <Grid.Column>
          <br />
          <Form.Element label="Hover Dimension">
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button active={active} onClick={onClick}>
                  {hoverDimension}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  <Dropdown.Item
                    id="auto"
                    value="auto"
                    onClick={onSetHoverDimension}
                    selected={hoverDimension === 'auto'}
                  >
                    Auto
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="x"
                    value="x"
                    onClick={onSetHoverDimension}
                    selected={hoverDimension === 'x'}
                  >
                    X Axis
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="y"
                    value="y"
                    onClick={onSetHoverDimension}
                    selected={hoverDimension === 'y'}
                  >
                    Y Axis
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="xy"
                    value="xy"
                    onClick={onSetHoverDimension}
                    selected={hoverDimension === 'xy'}
                  >
                    X & Y Axis
                  </Dropdown.Item>
                </Dropdown.Menu>
              )}
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column>
          <h5 className="view-options--header">X Axis</h5>
        </Grid.Column>
        <Grid.Column>
          <AxisTicksGenerator
            axisName="x"
            columnType={xColumn}
            label="X Axis Tick Generator"
            onSetGenerateAxisTicks={onSetGenerateXAxisTicks}
            onSetTotalTicks={onSetXTotalTicks}
            onSetTickStart={onSetXTickStart}
            onSetTickStep={onSetXTickStep}
          />
        </Grid.Column>
        <Grid.Column>
          <h5 className="view-options--header">Y Axis</h5>
        </Grid.Column>
        <YAxisTitle label={label} onUpdateYAxisLabel={onUpdateYAxisLabel} />
        <YAxisBase base={base} onUpdateYAxisBase={onUpdateYAxisBase} />
        <AxisAffixes
          prefix={prefix}
          suffix={suffix}
          axisName="y"
          onUpdateAxisPrefix={prefix => onUpdateAxisPrefix(prefix, 'y')}
          onUpdateAxisSuffix={suffix => onUpdateAxisSuffix(suffix, 'y')}
        />
        <Grid.Column>
          <AxisTicksGenerator
            axisName="y"
            columnType={yColumn}
            label="Y Axis Tick Generator"
            onSetGenerateAxisTicks={onSetGenerateYAxisTicks}
            onSetTotalTicks={onSetYTotalTicks}
            onSetTickStart={onSetYTickStart}
            onSetTickStep={onSetYTickStep}
          />
        </Grid.Column>
        <Grid.Column>
          <AutoDomainInput
            domain={this.yDomain}
            onSetDomain={this.handleSetYDomain}
            label="Y Axis Domain"
          />
          <Form.Element label="Positioning">
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button active={active} onClick={onClick}>
                  {capitalize(position)}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  <Dropdown.Item
                    id="overlaid"
                    value="overlaid"
                    onClick={onSetPosition}
                    selected={position === 'overlaid'}
                  >
                    Overlaid
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="stacked"
                    value="stacked"
                    onClick={onSetPosition}
                    selected={position === 'stacked'}
                  >
                    Stacked
                  </Dropdown.Item>
                </Dropdown.Menu>
              )}
            />
          </Form.Element>
        </Grid.Column>
        <LegendOrientation
          onLegendOpacityChange={onSetLegendOpacity}
          onLegendOrientationThresholdChange={onSetLegendOrientationThreshold}
        />
      </>
    )
  }

  private get yDomain(): [number, number] {
    return parseYBounds(this.props.axes.y.bounds)
  }

  private setBoundValues = (value: number | null): string | null => {
    return value === null ? null : String(value)
  }

  private handleSetYDomain = (yDomain: [number, number]): void => {
    let bounds: [string | null, string | null]

    if (yDomain) {
      const [min, max] = yDomain
      bounds = [this.setBoundValues(min), this.setBoundValues(max)]
    } else {
      bounds = [null, null]
    }

    this.props.onUpdateYAxisBounds(bounds)
  }
}

const mstp = (state: AppState) => {
  const xColumn = getXColumnSelection(state)
  const yColumn = getYColumnSelection(state)
  const numericColumns = getNumericColumns(state)
  const view = getActiveTimeMachine(state).view as NewView<XYViewProperties>
  const {timeFormat} = view.properties
  return {xColumn, yColumn, numericColumns, timeFormat}
}

const mdtp = {
  onUpdateYAxisLabel: setYAxisLabel,
  onUpdateAxisPrefix: setAxisPrefix,
  onUpdateAxisSuffix: setAxisSuffix,
  onUpdateYAxisBounds: setYAxisBounds,
  onUpdateYAxisBase: setYAxisBase,
  onSetXColumn: setXColumn,
  onSetYColumn: setYColumn,
  onSetShadeBelow: setShadeBelow,
  onUpdateColors: setColors,
  onSetGeom: setGeom,
  onSetPosition: setLinePosition,
  onSetTimeFormat: setTimeFormat,
  onSetHoverDimension: setHoverDimension,
  onSetLegendOpacity: setLegendOpacity,
  onSetLegendOrientationThreshold: setLegendOrientationThreshold,
  onSetGenerateXAxisTicks: setGenerateXAxisTicks,
  onSetXTotalTicks: setXTotalTicks,
  onSetXTickStart: setXTickStart,
  onSetXTickStep: setXTickStep,
  onSetGenerateYAxisTicks: setGenerateYAxisTicks,
  onSetYTotalTicks: setYTotalTicks,
  onSetYTickStart: setYTickStart,
  onSetYTickStep: setYTickStep,
}

const connector = connect(mstp, mdtp)

export default connector(LineOptions)
