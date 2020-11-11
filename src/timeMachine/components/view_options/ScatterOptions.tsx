// Libraries
import React, {FunctionComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Form, Input, Grid, MultiSelectDropdown} from '@influxdata/clockface'
import AxisAffixes from 'src/timeMachine/components/view_options/AxisAffixes'
import TimeFormat from 'src/timeMachine/components/view_options/TimeFormat'
import LegendOrientation from 'src/timeMachine/components/view_options/LegendOrientation'
import AxisTicksGenerator from 'src/shared/components/axisTicks/AxisTicksGenerator'

// Actions
import {
  setFillColumns,
  setSymbolColumns,
  setYAxisLabel,
  setXAxisLabel,
  setAxisPrefix,
  setAxisSuffix,
  setColorHexes,
  setXDomain,
  setYDomain,
  setXColumn,
  setYColumn,
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
  getGroupableColumns,
  getFillColumnsSelection,
  getSymbolColumnsSelection,
  getXColumnSelection,
  getYColumnSelection,
  getNumericColumns,
  getActiveTimeMachine,
} from 'src/timeMachine/selectors'

// Constants
import {GIRAFFE_COLOR_SCHEMES} from 'src/shared/constants'

// Types
import {ComponentStatus} from '@influxdata/clockface'
import {AppState, NewView, ScatterViewProperties} from 'src/types'
import HexColorSchemeDropdown from 'src/shared/components/HexColorSchemeDropdown'
import AutoDomainInput from 'src/shared/components/AutoDomainInput'
import ColumnSelector from 'src/shared/components/ColumnSelector'

interface OwnProps {
  xColumn: string
  yColumn: string
  fillColumns: string[]
  symbolColumns: string[]
  xDomain: number[]
  yDomain: number[]
  xAxisLabel: string
  yAxisLabel: string
  xPrefix: string
  xSuffix: string
  yPrefix: string
  ySuffix: string
  colors: string[]
  showNoteWhenEmpty: boolean
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const ScatterOptions: FunctionComponent<Props> = props => {
  const {
    fillColumns,
    symbolColumns,
    availableGroupColumns,
    yAxisLabel,
    xAxisLabel,
    onSetFillColumns,
    onSetSymbolColumns,
    colors,
    onSetColors,
    onSetYAxisLabel,
    onSetXAxisLabel,
    xPrefix,
    xSuffix,
    yPrefix,
    ySuffix,
    onUpdateAxisSuffix,
    onUpdateAxisPrefix,
    xDomain,
    onSetXDomain,
    yDomain,
    onSetYDomain,
    xColumn,
    yColumn,
    numericColumns,
    onSetXColumn,
    onSetYColumn,
    onSetTimeFormat,
    timeFormat,
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
  } = props

  const groupDropdownStatus = availableGroupColumns.length
    ? ComponentStatus.Default
    : ComponentStatus.Disabled

  const handleFillColumnSelect = (column: string): void => {
    let updatedFillColumns

    if (fillColumns.includes(column)) {
      updatedFillColumns = fillColumns.filter(col => col !== column)
    } else {
      updatedFillColumns = [...fillColumns, column]
    }

    onSetFillColumns(updatedFillColumns)
  }

  const handleSymbolColumnSelect = (column: string): void => {
    let updatedSymbolColumns

    if (symbolColumns.includes(column)) {
      updatedSymbolColumns = symbolColumns.filter(col => col !== column)
    } else {
      updatedSymbolColumns = [...symbolColumns, column]
    }

    onSetSymbolColumns(updatedSymbolColumns)
  }

  return (
    <Grid.Column>
      <h4 className="view-options--header">Customize Scatter Plot</h4>
      <h5 className="view-options--header">Data</h5>

      <Form.Element label="Symbol Column">
        <MultiSelectDropdown
          options={availableGroupColumns}
          selectedOptions={symbolColumns}
          onSelect={handleSymbolColumnSelect}
          buttonStatus={groupDropdownStatus}
        />
      </Form.Element>
      <Form.Element label="Fill Column">
        <MultiSelectDropdown
          options={availableGroupColumns}
          selectedOptions={fillColumns}
          onSelect={handleFillColumnSelect}
          buttonStatus={groupDropdownStatus}
        />
      </Form.Element>
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
      <Form.Element label="Color Scheme">
        <HexColorSchemeDropdown
          colorSchemes={GIRAFFE_COLOR_SCHEMES}
          selectedColorScheme={colors}
          onSelectColorScheme={onSetColors}
        />
      </Form.Element>
      <h5 className="view-options--header">X Axis</h5>
      <Form.Element label="X Axis Label">
        <Input
          value={xAxisLabel}
          onChange={e => onSetXAxisLabel(e.target.value)}
        />
      </Form.Element>
      <Grid.Row>
        <AxisAffixes
          prefix={xPrefix}
          suffix={xSuffix}
          axisName="x"
          onUpdateAxisPrefix={prefix => onUpdateAxisPrefix(prefix, 'x')}
          onUpdateAxisSuffix={suffix => onUpdateAxisSuffix(suffix, 'x')}
        />
      </Grid.Row>
      <AxisTicksGenerator
        axisName="x"
        columnType={xColumn}
        label="X Axis Tick Generator"
        onSetGenerateAxisTicks={onSetGenerateXAxisTicks}
        onSetTotalTicks={onSetXTotalTicks}
        onSetTickStart={onSetXTickStart}
        onSetTickStep={onSetXTickStep}
      />
      <AutoDomainInput
        domain={xDomain as [number, number]}
        onSetDomain={onSetXDomain}
        label="X Axis Domain"
      />
      <h5 className="view-options--header">Y Axis</h5>
      <Form.Element label="Y Axis Label">
        <Input
          value={yAxisLabel}
          onChange={e => onSetYAxisLabel(e.target.value)}
        />
      </Form.Element>
      <Grid.Row>
        <AxisAffixes
          prefix={yPrefix}
          suffix={ySuffix}
          axisName="y"
          onUpdateAxisPrefix={prefix => onUpdateAxisPrefix(prefix, 'y')}
          onUpdateAxisSuffix={suffix => onUpdateAxisSuffix(suffix, 'y')}
        />
      </Grid.Row>
      <AxisTicksGenerator
        axisName="y"
        columnType={yColumn}
        label="Y Axis Tick Generator"
        onSetGenerateAxisTicks={onSetGenerateYAxisTicks}
        onSetTotalTicks={onSetYTotalTicks}
        onSetTickStart={onSetYTickStart}
        onSetTickStep={onSetYTickStep}
      />
      <AutoDomainInput
        domain={yDomain as [number, number]}
        onSetDomain={onSetYDomain}
        label="Y Axis Domain"
      />
      <LegendOrientation
        onLegendOpacityChange={onSetLegendOpacity}
        onLegendOrientationThresholdChange={onSetLegendOrientationThreshold}
      />
    </Grid.Column>
  )
}

const mstp = (state: AppState) => {
  const availableGroupColumns = getGroupableColumns(state)
  const fillColumns = getFillColumnsSelection(state)
  const symbolColumns = getSymbolColumnsSelection(state)
  const xColumn = getXColumnSelection(state)
  const yColumn = getYColumnSelection(state)
  const numericColumns = getNumericColumns(state)
  const view = getActiveTimeMachine(state).view as NewView<
    ScatterViewProperties
  >
  const {timeFormat} = view.properties

  return {
    availableGroupColumns,
    fillColumns,
    symbolColumns,
    xColumn,
    yColumn,
    numericColumns,
    timeFormat,
  }
}

const mdtp = {
  onSetFillColumns: setFillColumns,
  onSetSymbolColumns: setSymbolColumns,
  onSetColors: setColorHexes,
  onSetYAxisLabel: setYAxisLabel,
  onSetXAxisLabel: setXAxisLabel,
  onUpdateAxisPrefix: setAxisPrefix,
  onUpdateAxisSuffix: setAxisSuffix,
  onSetXDomain: setXDomain,
  onSetYDomain: setYDomain,
  onSetXColumn: setXColumn,
  onSetYColumn: setYColumn,
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
export default connector(ScatterOptions)
