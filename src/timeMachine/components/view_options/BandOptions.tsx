// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

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
  SetHoverDimension,
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

interface OwnProps {
  type: ViewType
  axes: Axes
  geom?: XYGeom
  colors: Color[]
  shadeBelow?: boolean
  hoverDimension?: 'auto' | 'x' | 'y' | 'xy'
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

class BandOptions extends PureComponent<Props> {
  public render() {
    const {
      axes: {
        y: {label, prefix, suffix, base},
      },
      colors,
      geom,
      shadeBelow,
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
      hoverDimension = 'auto',
      onSetHoverDimension,
    } = this.props

    return (
      <>
        <Grid.Column>
          <h4 className="view-options--header">Customize Band Plot</h4>
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
          <AutoDomainInput
            domain={this.yDomain}
            onSetDomain={this.handleSetYDomain}
            label="Y Axis Domain"
          />
        </Grid.Column>
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
  onSetHoverDimension: SetHoverDimension,
}

const connector = connect(mstp, mdtp)

export default connector(BandOptions)
