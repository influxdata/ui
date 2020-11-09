// Libraries
import React, {FunctionComponent, ChangeEvent, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {VIRIDIS, MAGMA, INFERNO, PLASMA} from '@influxdata/giraffe'
import {
  Form,
  Grid,
  Input,
  Columns,
  InputType,
  ComponentStatus,
} from '@influxdata/clockface'
import TimeFormat from 'src/timeMachine/components/view_options/TimeFormat'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

// Components
import AutoDomainInput from 'src/shared/components/AutoDomainInput'
import HexColorSchemeDropdown from 'src/shared/components/HexColorSchemeDropdown'
import ColumnSelector from 'src/shared/components/ColumnSelector'
import LegendOrientation from 'src/timeMachine/components/view_options/LegendOrientation'
import AxisTicksGenerator from 'src/shared/components/axisTicks/AxisTicksGenerator'

// Actions
import {
  setXColumn,
  setYColumn,
  setBinSize,
  setColorHexes,
  setXDomain,
  setYDomain,
  setXAxisLabel,
  setYAxisLabel,
  setAxisPrefix,
  setAxisSuffix,
  setTimeFormat,
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
import {
  getXColumnSelection,
  getYColumnSelection,
  getNumericColumns,
  getActiveTimeMachine,
} from 'src/timeMachine/selectors'

// Types
import {AppState, NewView, HeatmapViewProperties} from 'src/types'

const HEATMAP_COLOR_SCHEMES = [
  {name: 'Magma', colors: MAGMA},
  {name: 'Inferno', colors: INFERNO},
  {name: 'Viridis', colors: VIRIDIS},
  {name: 'Plasma', colors: PLASMA},
]

interface OwnProps {
  xDomain: number[]
  yDomain: number[]
  xAxisLabel: string
  yAxisLabel: string
  xPrefix: string
  xSuffix: string
  yPrefix: string
  ySuffix: string
  colors: string[]
  binSize: number
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

const HeatmapOptions: FunctionComponent<Props> = props => {
  const {
    onSetGenerateXAxisTicks,
    onSetXTotalTicks,
    onSetXTickStart,
    onSetXTickStep,
    onSetGenerateYAxisTicks,
    onSetYTotalTicks,
    onSetYTickStart,
    onSetYTickStep,
  } = props

  const [binInputStatus, setBinInputStatus] = useState(ComponentStatus.Default)
  const [binInput, setBinInput] = useState(props.binSize)

  const onSetBinSize = (e: ChangeEvent<HTMLInputElement>) => {
    const val = convertUserInputToNumOrNaN(e)
    setBinInput(val)

    if (isNaN(val) || val < 5) {
      setBinInputStatus(ComponentStatus.Error)
      return
    }

    setBinInputStatus(ComponentStatus.Default)
    props.onSetBinSize(val)
  }

  return (
    <Grid.Column>
      <h4 className="view-options--header">Customize Heatmap</h4>
      <h5 className="view-options--header">Data</h5>
      <ColumnSelector
        selectedColumn={props.xColumn}
        onSelectColumn={props.onSetXColumn}
        availableColumns={props.numericColumns}
        axisName="x"
      />
      <ColumnSelector
        selectedColumn={props.yColumn}
        onSelectColumn={props.onSetYColumn}
        availableColumns={props.numericColumns}
        axisName="y"
      />
      <Form.Element label="Time Format">
        <TimeFormat
          timeFormat={props.timeFormat}
          onTimeFormatChange={props.onSetTimeFormat}
        />
      </Form.Element>
      <h5 className="view-options--header">Options</h5>
      <Form.Element label="Color Scheme">
        <HexColorSchemeDropdown
          colorSchemes={HEATMAP_COLOR_SCHEMES}
          selectedColorScheme={props.colors}
          onSelectColorScheme={props.onSetColors}
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
      <h5 className="view-options--header">X Axis</h5>
      <Form.Element label="X Axis Label">
        <Input
          value={props.xAxisLabel}
          onChange={e => props.onSetXAxisLabel(e.target.value)}
        />
      </Form.Element>
      <Grid.Row>
        <Grid.Column widthSM={Columns.Six}>
          <Form.Element label="X Tick Prefix">
            <Input
              value={props.xPrefix}
              onChange={e => props.onSetPrefix(e.target.value, 'x')}
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column widthSM={Columns.Six}>
          <Form.Element label="X Tick Suffix">
            <Input
              value={props.xSuffix}
              onChange={e => props.onSetSuffix(e.target.value, 'x')}
            />
          </Form.Element>
        </Grid.Column>
      </Grid.Row>
      <AxisTicksGenerator
        axisName="x"
        columnType={props.xColumn}
        label="X Axis Tick Generator"
        onSetGenerateAxisTicks={onSetGenerateXAxisTicks}
        onSetTotalTicks={onSetXTotalTicks}
        onSetTickStart={onSetXTickStart}
        onSetTickStep={onSetXTickStep}
      />
      <AutoDomainInput
        domain={props.xDomain as [number, number]}
        onSetDomain={props.onSetXDomain}
        label="X Axis Domain"
      />
      <h5 className="view-options--header">Y Axis</h5>
      <Form.Element label="Y Axis Label">
        <Input
          value={props.yAxisLabel}
          onChange={e => props.onSetYAxisLabel(e.target.value)}
        />
      </Form.Element>
      <Grid.Row>
        <Grid.Column widthSM={Columns.Six}>
          <Form.Element label="Y Tick Prefix">
            <Input
              value={props.yPrefix}
              onChange={e => props.onSetPrefix(e.target.value, 'y')}
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column widthSM={Columns.Six}>
          <Form.Element label="Y Tick Suffix">
            <Input
              value={props.ySuffix}
              onChange={e => props.onSetSuffix(e.target.value, 'y')}
            />
          </Form.Element>
        </Grid.Column>
      </Grid.Row>
      <AxisTicksGenerator
        axisName="y"
        columnType={props.yColumn}
        label="Y Axis Tick Generator"
        onSetGenerateAxisTicks={onSetGenerateYAxisTicks}
        onSetTotalTicks={onSetYTotalTicks}
        onSetTickStart={onSetYTickStart}
        onSetTickStep={onSetYTickStep}
      />
      <AutoDomainInput
        domain={props.yDomain as [number, number]}
        onSetDomain={props.onSetYDomain}
        label="Y Axis Domain"
      />
      <LegendOrientation
        onLegendOpacityChange={props.onSetLegendOpacity}
        onLegendOrientationThresholdChange={
          props.onSetLegendOrientationThreshold
        }
      />
    </Grid.Column>
  )
}

const mstp = (state: AppState) => {
  const xColumn = getXColumnSelection(state)
  const yColumn = getYColumnSelection(state)
  const numericColumns = getNumericColumns(state)
  const view = getActiveTimeMachine(state).view as NewView<
    HeatmapViewProperties
  >
  const {timeFormat} = view.properties
  return {xColumn, yColumn, numericColumns, timeFormat}
}

const mdtp = {
  onSetXColumn: setXColumn,
  onSetYColumn: setYColumn,
  onSetBinSize: setBinSize,
  onSetColors: setColorHexes,
  onSetXDomain: setXDomain,
  onSetYDomain: setYDomain,
  onSetXAxisLabel: setXAxisLabel,
  onSetYAxisLabel: setYAxisLabel,
  onSetPrefix: setAxisPrefix,
  onSetSuffix: setAxisSuffix,
  onSetTimeFormat: setTimeFormat,
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

export default connector(HeatmapOptions)
